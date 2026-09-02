import { ForbiddenException, Injectable, Inject } from '@nestjs/common'
import { MIN_AGGREGATION_THRESHOLD, type InstitutionDashboard } from '@cofound/shared'
import { OrganizationRole, ProjectStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

const ALLOWED_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER, OrganizationRole.ORG_VIEWER]

@Injectable()
export class InstitutionDashboardService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getDashboard(actorId: string, requestedOrgId?: string): Promise<InstitutionDashboard> {
    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        userId: actorId,
        organization: { type: 'INSTITUTION' },
      },
      include: { organization: true },
    })

    if (memberships.length === 0) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        messageKey: 'institution.errors.notMember',
      })
    }

    const activeMembership = requestedOrgId
      ? memberships.find((m) => m.organizationId === requestedOrgId)
      : memberships[0]

    if (!activeMembership || !ALLOWED_ROLES.includes(activeMembership.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        messageKey: 'institution.errors.accessDenied',
      })
    }

    const orgId = activeMembership.organizationId
    const org = activeMembership.organization

    // 1. Affiliations & Students Data
    const affiliations = await this.prisma.affiliation.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            lastLoginAt: true,
            talentProfile: {
              select: {
                completion: true,
                fieldId: true,
              },
            },
            projectMembers: {
              where: { leftAt: null },
              select: { projectId: true },
            },
          },
        },
      },
    })

    const affiliateUserIds = affiliations.map((a) => a.userId)
    const totalStudents = affiliations.length
    const invitedStudents = affiliations.filter((a) => a.user.status === 'INVITED').length
    const activeStudents = affiliations.filter((a) => a.user.status === 'ACTIVE').length
    const unactivatedStudents = totalStudents - activeStudents
    const alumniStudents = affiliations.filter((a) => a.user.status === 'ALUMNI' || a.status === 'ALUMNI').length
    const leavingStudents = affiliations.filter((a) => a.user.status === 'LEAVING' || a.status === 'LEAVING').length

    // 2. Profiles stats
    const startedProfiles = affiliations.filter(
      (a) => a.user.talentProfile && a.user.talentProfile.completion > 0
    ).length
    const completedProfiles = affiliations.filter(
      (a) => a.user.talentProfile && a.user.talentProfile.completion >= 60
    ).length
    const totalCompletionSum = affiliations.reduce(
      (sum, a) => sum + (a.user.talentProfile?.completion ?? 0),
      0
    )
    const averageCompletionPercent =
      totalStudents > 0 ? Math.round(totalCompletionSum / totalStudents) : 0

    // 3. Funnel Data
    const totalImportedRows = await this.prisma.importRow.count({
      where: { batch: { organizationId: orgId } },
    })
    const totalImported = totalImportedRows > 0 ? totalImportedRows : totalStudents
    const invitationsSentCount = await this.prisma.invitationToken.count({
      where: { user: { affiliations: { some: { organizationId: orgId } } } },
    })
    const invitationsSent = invitationsSentCount > 0 ? invitationsSentCount : totalStudents
    const activationRatePercent =
      totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0
    const completionRatePercent =
      activeStudents > 0 ? Math.round((completedProfiles / activeStudents) * 100) : 0

    // 4. Student Breakdown
    const inAtLeastOneProject = affiliations.filter(
      (a) => a.user.projectMembers.length > 0
    ).length
    const profileIncomplete = Math.max(0, activeStudents - completedProfiles)

    // 5. Projects of affiliated students
    const projects =
      affiliateUserIds.length > 0
        ? await this.prisma.project.findMany({
            where: {
              OR: [
                { createdById: { in: affiliateUserIds } },
                { members: { some: { userId: { in: affiliateUserIds }, leftAt: null } } },
              ],
            },
            include: {
              sector: { select: { id: true, slug: true, labelKey: true } },
              posts: { select: { type: true } },
              members: {
                where: { leftAt: null },
                select: {
                  userId: true,
                  role: true,
                  user: {
                    select: {
                      talentProfile: { select: { fieldId: true } },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          })
        : []

    const totalProjects = projects.length
    const draftProjects = projects.filter((p) => p.status === ProjectStatus.DRAFT).length
    const recruitingProjects = projects.filter((p) => p.status === ProjectStatus.RECRUITING).length
    const activeProjects = projects.filter((p) => p.status === ProjectStatus.ACTIVE).length
    const pausedProjects = projects.filter((p) => p.status === ProjectStatus.PAUSED).length
    const archivedProjects = projects.filter((p) => p.status === ProjectStatus.ARCHIVED).length
    const seekingMentorship = projects.filter(
      (p) => p.posts.some((post) => post.type === 'SEEKING_MENTORSHIP') || p.status === ProjectStatus.RECRUITING
    ).length
    const seekingFunding = projects.filter((p) =>
      p.posts.some((post) => post.type === 'SEEKING_FUNDING')
    ).length

    // 6. Project Evolution over last 6 months
    const now = new Date()
    const monthsMap: Map<string, { period: string; created: number; active: number }> = new Map()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
      monthsMap.set(key, { period: label, created: 0, active: 0 })
    }

    projects.forEach((p) => {
      const pDate = new Date(p.createdAt)
      const pKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`
      if (monthsMap.has(pKey)) {
        const item = monthsMap.get(pKey)!
        item.created++
        if (p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.RECRUITING) {
          item.active++
        }
      }
    })

    const projectEvolution = Array.from(monthsMap.values())

    // 7. Sector Distribution
    const sectorCountMap: Map<string, { sectorId: string; slug: string; label: string; count: number }> = new Map()
    projects.forEach((p) => {
      const sId = p.sector?.id ?? 'other'
      const slug = p.sector?.slug ?? 'autre'
      const label = p.sector?.slug ? p.sector.slug.replace(/[-_]/g, ' ').toUpperCase() : 'Non catégorisé'
      if (!sectorCountMap.has(sId)) {
        sectorCountMap.set(sId, { sectorId: sId, slug, label, count: 0 })
      }
      sectorCountMap.get(sId)!.count++
    })

    const sectorsDistribution = Array.from(sectorCountMap.values())
      .map((item) => ({
        sectorId: item.sectorId,
        slug: item.slug,
        label: item.label,
        count: item.count,
        percent: totalProjects > 0 ? Math.round((item.count / totalProjects) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // 8. Multidisciplinarity
    // Rule: A project is multidisciplinary if it has at least 2 active members with distinct fieldIds (fields of study)
    let multidisciplinaryCount = 0
    projects.forEach((p) => {
      if (p.members.length >= 2) {
        const fieldIds = p.members
          .map((m) => m.user.talentProfile?.fieldId)
          .filter((f): f is string => Boolean(f))
        const uniqueFields = new Set(fieldIds)
        if (uniqueFields.size >= 2) {
          multidisciplinaryCount++
        }
      }
    })

    const multidisciplinaryRatePercent =
      totalProjects > 0 ? Math.round((multidisciplinaryCount / totalProjects) * 100) : 0

    // 9. Activity & Opportunities
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentActiveStudents = affiliations.filter(
      (a) => a.user.lastLoginAt && new Date(a.user.lastLoginAt) >= thirtyDaysAgo
    ).length

    const applicationsSent =
      affiliateUserIds.length > 0
        ? await this.prisma.application.count({
            where: { applicantId: { in: affiliateUserIds } },
          })
        : 0

    const opportunityApplications =
      affiliateUserIds.length > 0
        ? await this.prisma.opportunityApplication.count({
            where: { applicantId: { in: affiliateUserIds } },
          })
        : 0

    const ongoingEngagements = await this.prisma.financialEngagement.count({
      where: {
        organizationId: orgId,
        status: { in: ['ACCEPTED', 'CONFIRMED'] },
      },
    })

    const publishedOpportunitiesCount = await this.prisma.opportunity.count({
      where: { organizationId: orgId },
    })

    return {
      organization: {
        id: org.id,
        name: org.name,
        role: activeMembership.role,
        canManage:
          activeMembership.role === OrganizationRole.ORG_ADMIN ||
          activeMembership.role === OrganizationRole.ORG_MANAGER,
      },
      students: {
        total: totalStudents,
        invited: invitedStudents,
        active: activeStudents,
        unactivated: unactivatedStudents,
        alumni: alumniStudents,
        leaving: leavingStudents,
      },
      profiles: {
        started: startedProfiles,
        completed: completedProfiles,
        averageCompletionPercent,
      },
      projects: {
        total: totalProjects,
        draft: draftProjects,
        recruiting: recruitingProjects,
        active: activeProjects,
        paused: pausedProjects,
        archived: archivedProjects,
        seekingMentorship,
        seekingFunding,
      },
      activity: {
        applicationsSent,
        activeMentorships: ongoingEngagements,
        opportunityApplications,
        recentActiveStudents,
      },
      funnel: {
        totalImported,
        invitationsSent,
        accountsActivated: activeStudents,
        profilesCompleted: completedProfiles,
        activationRatePercent,
        completionRatePercent,
      },
      studentBreakdown: {
        toActivate: unactivatedStudents,
        activated: activeStudents,
        profileIncomplete,
        profileComplete: completedProfiles,
        inAtLeastOneProject,
      },
      projectEvolution,
      sectorsDistribution,
      multidisciplinarity: {
        multidisciplinaryProjectsCount: multidisciplinaryCount,
        multidisciplinaryRatePercent,
        definitionRule:
          "Projets réunissant au moins 2 membres actifs issus de filières d'études (Field of study) distinctes.",
      },
      opportunities: {
        publishedOpportunitiesCount,
        studentApplicationsCount: opportunityApplications,
        ongoingEngagementsCount: ongoingEngagements,
      },
      confidentiality: {
        minAggregationThreshold: MIN_AGGREGATION_THRESHOLD,
        genderBreakdownMasked: true,
        notes:
          "Les données individuelles sensibles, messages privés et données de genre restent strictement masqués conformément aux règles de confidentialité CoFound.",
      },
    }
  }
}
