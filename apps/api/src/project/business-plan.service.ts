import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  type BpPatchInput,
  type BpResponse,
  type BpSections,
  type BmcBlocks,
  type DtIteration,
} from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class BusinessPlanService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async get(actorId: string, projectId: string): Promise<BpResponse> {
    await this.assertMember(actorId, projectId)
    const record = await this.prisma.projectBusinessPlan.findUnique({ where: { projectId } })
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sector: true,
        region: true,
        members: { where: { leftAt: null }, include: { user: { include: { talentProfile: true, talentIdentity: true } } } },
      },
    })

    if (!record) {
      const defaultSections = this.createDefaultSections(project)
      const sectionCompletion = this.calculateSectionCompletions(defaultSections)
      const completion = this.calculateOverallCompletion(sectionCompletion)

      return {
        projectId,
        sections: defaultSections,
        sectionCompletion,
        completion,
        updatedAt: null,
        updatedById: null,
      }
    }

    return this.toResponse(projectId, record)
  }

  async patch(actorId: string, projectId: string, input: BpPatchInput): Promise<BpResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({
        where: { id: projectId },
        include: {
          sector: true,
          region: true,
          members: { where: { leftAt: null }, include: { user: { include: { talentProfile: true, talentIdentity: true } } } },
        },
      })
      const current = await transaction.projectBusinessPlan.findUnique({ where: { projectId } })

      let sections: BpSections
      if (!current || !current.sections || typeof current.sections !== 'object') {
        sections = this.createDefaultSections(project)
      } else {
        sections = this.normalizeSections(current.sections, project)
      }

      const key = input.sectionKey
      ;(sections as Record<string, unknown>)[key] = { ...sections[key], ...input.data }

      const sectionCompletion = this.calculateSectionCompletions(sections)
      const completion = this.calculateOverallCompletion(sectionCompletion)

      const saved = await transaction.projectBusinessPlan.upsert({
        where: { projectId },
        create: {
          projectId,
          sections: sections as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
        update: {
          sections: sections as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
      })

      return this.toResponse(projectId, saved)
    })
  }

  async syncFromUpstream(actorId: string, projectId: string, overwrite = false): Promise<BpResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({
        where: { id: projectId },
        include: {
          sector: true,
          region: true,
          canvas: true,
          designThinking: true,
          finance: true,
          members: { where: { leftAt: null }, include: { user: { include: { talentProfile: true, talentIdentity: true } } } },
        },
      })
      if (!project) throw new NotFoundException('Projet introuvable.')

      const current = await transaction.projectBusinessPlan.findUnique({ where: { projectId } })
      let sections: BpSections
      if (!current || !current.sections || typeof current.sections !== 'object') {
        sections = this.createDefaultSections(project)
      } else {
        sections = this.normalizeSections(current.sections, project)
      }

      // Sync from Project & Members
      if (overwrite || !sections.projectPresentation.projectName) {
        sections.projectPresentation.projectName = project.title
      }
      if (overwrite || !sections.projectPresentation.problemSummary) {
        sections.projectPresentation.problemSummary = project.pitch
      }

      // Sync Founders from project members
      if (overwrite || sections.organization.founders.length === 0) {
        sections.organization.founders = project.members.map((m) => {
          const name = [m.user.talentIdentity?.firstName, m.user.talentIdentity?.lastName].filter(Boolean).join(' ') || m.user.talentProfile?.pseudonym || m.user.email
          const rawGoals = m.user.talentProfile?.goals
          const skills = Array.isArray(rawGoals) ? (rawGoals as string[]) : []
          return {
            name,
            role: m.role === 'OWNER' ? 'Fondateur / Porteur de projet' : m.functionalRole || 'Co-fondateur',
            skills,
            experienceSummary: m.user.talentProfile?.headline || m.user.talentProfile?.bio || '',
          }
        })
      }

      // Sync from Design Thinking
      if (project.designThinking && Array.isArray(project.designThinking.iterations)) {
        const iterations = project.designThinking.iterations as unknown as DtIteration[]
        const activeIt = iterations[project.designThinking.activeIterationIndex] || iterations[0]
        if (activeIt) {
          if (overwrite || !sections.marketStudy.targetMarket) {
            sections.marketStudy.targetMarket = activeIt.understand.targetUsers || sections.marketStudy.targetMarket
          }
          if (overwrite || !sections.marketStudy.customerNeeds) {
            sections.marketStudy.customerNeeds = activeIt.understand.userNeeds.join(', ') || activeIt.understand.problem || sections.marketStudy.customerNeeds
          }
          if (overwrite || !sections.projectPresentation.solutionSummary) {
            sections.projectPresentation.solutionSummary = activeIt.prototype.solutionDescription || activeIt.define.problemStatement || sections.projectPresentation.solutionSummary
          }
          if (overwrite || !sections.productService.description) {
            sections.productService.description = activeIt.prototype.solutionDescription || sections.productService.description
          }
          if (overwrite || !sections.productService.valueProposition) {
            sections.productService.valueProposition = activeIt.define.problemStatement || sections.productService.valueProposition
          }
        }
      }

      // Sync from BMC
      if (project.canvas && project.canvas.blocks && typeof project.canvas.blocks === 'object') {
        const blocks = project.canvas.blocks as unknown as BmcBlocks
        if (blocks.customerSegments?.content && (overwrite || sections.marketStudy.marketSegments.length === 0)) {
          sections.marketStudy.marketSegments = blocks.customerSegments.content.split('\n').map((s) => s.trim()).filter(Boolean)
        }
        if (blocks.valuePropositions?.content && (overwrite || !sections.productService.valueProposition)) {
          sections.productService.valueProposition = blocks.valuePropositions.content
        }
        if (blocks.channels?.content && (overwrite || sections.commercialStrategy.acquisitionChannels.length === 0)) {
          sections.commercialStrategy.acquisitionChannels = blocks.channels.content.split('\n').map((s) => s.trim()).filter(Boolean)
        }
        if (blocks.revenueStreams?.content && (overwrite || !sections.businessModel.revenueStreamsDescription)) {
          sections.businessModel.revenueStreamsDescription = blocks.revenueStreams.content
        }
        if (blocks.costStructure?.content && (overwrite || !sections.businessModel.costDrivers)) {
          sections.businessModel.costDrivers = blocks.costStructure.content
        }
        if (blocks.keyActivities?.content && (overwrite || !sections.operations.productionProcess)) {
          sections.operations.productionProcess = blocks.keyActivities.content
        }
        if (blocks.keyResources?.content && (overwrite || !sections.operations.infrastructureAndEquipment)) {
          sections.operations.infrastructureAndEquipment = blocks.keyResources.content
        }
        if (blocks.keyPartners?.content && (overwrite || sections.organization.externalAdvisorsAndPartners.length === 0)) {
          sections.organization.externalAdvisorsAndPartners = blocks.keyPartners.content.split('\n').map((s) => s.trim()).filter(Boolean)
        }
      }

      // Sync from Finance
      if (project.finance) {
        const finCurrency = project.finance.currency || 'MGA'
        const rawInvestments = Array.isArray(project.finance.initialInvestments) ? (project.finance.initialInvestments as Array<{ amount?: number; label?: string }>) : []
        const totalInvestment = rawInvestments.reduce((acc, curr) => acc + (typeof curr.amount === 'number' ? curr.amount : 0), 0)

        if (overwrite || sections.financialPlan.fundingRequired === 0) {
          sections.financialPlan.fundingRequired = totalInvestment
          sections.financialPlan.fundingCurrency = finCurrency
        }
        if (overwrite || sections.financialPlan.useOfFunds.length === 0) {
          sections.financialPlan.useOfFunds = rawInvestments.map((item) => ({
            item: item.label || 'Investissement initial',
            amount: item.amount || 0,
            percentage: totalInvestment > 0 ? Math.round(((item.amount || 0) / totalInvestment) * 100) : 0,
          }))
        }
      }

      // Auto-generate Executive summary if empty
      if (overwrite || !sections.executiveSummary.content) {
        sections.executiveSummary.content = `Projet ${sections.projectPresentation.projectName || project.title} : ${sections.projectPresentation.solutionSummary || project.pitch}\n\nMarché Cible : ${sections.marketStudy.targetMarket || 'Non renseigné'}\nProposition de valeur : ${sections.productService.valueProposition || 'Non renseignée'}\nModèle économique : ${sections.businessModel.revenueStreamsDescription || 'Non renseigné'}`
      }

      const sectionCompletion = this.calculateSectionCompletions(sections)
      const completion = this.calculateOverallCompletion(sectionCompletion)

      const saved = await transaction.projectBusinessPlan.upsert({
        where: { projectId },
        create: {
          projectId,
          sections: sections as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
        update: {
          sections: sections as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
      })

      return this.toResponse(projectId, saved)
    })
  }

  private async assertMember(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, members: { where: { userId: actorId, leftAt: null }, select: { id: true, role: true } } },
    })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Accès au projet refusé.')
  }

  private createDefaultSections(
    project: {
      title: string
      pitch: string
      members?: Array<{
        role: string
        functionalRole: string | null
        user: {
          email: string
          talentProfile?: { pseudonym?: string | null; headline?: string | null; bio?: string | null; goals?: unknown } | null
          talentIdentity?: { firstName?: string | null; lastName?: string | null } | null
        }
      }>
    } | null
  ): BpSections {
    const title = project?.title || ''
    const pitch = project?.pitch || ''
    const founders = (project?.members || []).map((m) => {
      const name = [m.user.talentIdentity?.firstName, m.user.talentIdentity?.lastName].filter(Boolean).join(' ') || m.user.talentProfile?.pseudonym || m.user.email
      const rawGoals = m.user.talentProfile?.goals
      const skills = Array.isArray(rawGoals) ? (rawGoals as string[]) : []
      return {
        name,
        role: m.role === 'OWNER' ? 'Fondateur / Porteur de projet' : m.functionalRole || 'Co-fondateur',
        skills,
        experienceSummary: m.user.talentProfile?.headline || m.user.talentProfile?.bio || '',
      }
    })

    return {
      executiveSummary: {
        content: title ? `Présentation exécutive du projet ${title}. Objectif : structurer et lancer une activité viable répondant à un besoin validé.` : '',
        keyHighlights: [],
      },
      projectPresentation: {
        projectName: title,
        problemSummary: pitch,
        solutionSummary: '',
        vision: '',
        mission: '',
        shortTermObjectives: [],
        longTermObjectives: [],
      },
      marketStudy: {
        targetMarket: '',
        marketSegments: [],
        customerNeeds: '',
        marketTrends: '',
        competitors: [],
        existingAlternatives: '',
        competitiveAdvantage: '',
      },
      productService: {
        description: '',
        keyFeatures: [],
        valueProposition: '',
        differentiation: '',
        developmentStage: 'Phase de conception / prototype',
        futureRoadmap: '',
      },
      businessModel: {
        summary: '',
        revenueStreamsDescription: '',
        pricingStrategy: '',
        costDrivers: '',
      },
      commercialStrategy: {
        acquisitionChannels: [],
        distributionStrategy: '',
        pricingDetails: '',
        communicationPlan: '',
        conversionTactics: '',
        retentionAndLoyalty: '',
      },
      organization: {
        founders,
        governanceAndRoles: '',
        recruitmentNeeds: [],
        externalAdvisorsAndPartners: [],
      },
      operations: {
        productionProcess: '',
        suppliersAndProcurement: '',
        infrastructureAndEquipment: '',
        technologyStack: '',
        logisticsAndDelivery: '',
        qualityControl: '',
      },
      impactRisks: {
        risks: [],
        environmentalAndSocialImpact: '',
        sustainabilityCommitments: '',
      },
      financialPlan: {
        financialSummary: '',
        fundingRequired: 0,
        fundingCurrency: 'MGA',
        useOfFunds: [],
        breakEvenCommentary: '',
      },
    }
  }

  private normalizeSections(raw: unknown, project: { title: string; pitch: string } | null): BpSections {
    const candidate = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const defaults = this.createDefaultSections(project)

    const result: Record<string, unknown> = {}
    const sectionKeys: Array<keyof BpSections> = [
      'executiveSummary',
      'projectPresentation',
      'marketStudy',
      'productService',
      'businessModel',
      'commercialStrategy',
      'organization',
      'operations',
      'impactRisks',
      'financialPlan',
    ]

    for (const key of sectionKeys) {
      const rawSec = candidate[key] && typeof candidate[key] === 'object' ? (candidate[key] as Record<string, unknown>) : {}
      result[key] = { ...defaults[key], ...rawSec }
    }

    return result as unknown as BpSections
  }

  private calculateSectionCompletions(sections: BpSections): Record<string, number> {
    const scores: Record<string, number> = {}

    // 1. executiveSummary
    scores.executiveSummary = sections.executiveSummary.content.trim().length > 30 ? 100 : sections.executiveSummary.content.trim().length > 5 ? 50 : 0

    // 2. projectPresentation
    let pPres = 0
    if (sections.projectPresentation.projectName.trim()) pPres += 25
    if (sections.projectPresentation.problemSummary.trim()) pPres += 25
    if (sections.projectPresentation.solutionSummary.trim()) pPres += 25
    if (sections.projectPresentation.vision.trim() || sections.projectPresentation.mission.trim()) pPres += 25
    scores.projectPresentation = pPres

    // 3. marketStudy
    let mkt = 0
    if (sections.marketStudy.targetMarket.trim()) mkt += 30
    if (sections.marketStudy.customerNeeds.trim() || sections.marketStudy.marketSegments.length > 0) mkt += 35
    if (sections.marketStudy.competitors.length > 0 || sections.marketStudy.competitiveAdvantage.trim()) mkt += 35
    scores.marketStudy = mkt

    // 4. productService
    let prod = 0
    if (sections.productService.description.trim()) prod += 35
    if (sections.productService.valueProposition.trim()) prod += 35
    if (sections.productService.keyFeatures.length > 0 || sections.productService.differentiation.trim()) prod += 30
    scores.productService = prod

    // 5. businessModel
    let bm = 0
    if (sections.businessModel.revenueStreamsDescription.trim() || sections.businessModel.summary.trim()) bm += 50
    if (sections.businessModel.pricingStrategy.trim() || sections.businessModel.costDrivers.trim()) bm += 50
    scores.businessModel = bm

    // 6. commercialStrategy
    let comm = 0
    if (sections.commercialStrategy.acquisitionChannels.length > 0) comm += 40
    if (sections.commercialStrategy.distributionStrategy.trim() || sections.commercialStrategy.communicationPlan.trim()) comm += 30
    if (sections.commercialStrategy.conversionTactics.trim() || sections.commercialStrategy.retentionAndLoyalty.trim()) comm += 30
    scores.commercialStrategy = comm

    // 7. organization
    let org = 0
    if (sections.organization.founders.length > 0) org += 50
    if (sections.organization.governanceAndRoles.trim() || sections.organization.recruitmentNeeds.length > 0 || sections.organization.externalAdvisorsAndPartners.length > 0) org += 50
    scores.organization = org

    // 8. operations
    let ops = 0
    if (sections.operations.productionProcess.trim() || sections.operations.technologyStack.trim()) ops += 50
    if (sections.operations.infrastructureAndEquipment.trim() || sections.operations.suppliersAndProcurement.trim()) ops += 50
    scores.operations = ops

    // 9. impactRisks
    let ir = 0
    if (sections.impactRisks.risks.length > 0) ir += 50
    if (sections.impactRisks.environmentalAndSocialImpact.trim() || sections.impactRisks.sustainabilityCommitments.trim()) ir += 50
    scores.impactRisks = ir

    // 10. financialPlan
    let fin = 0
    if (sections.financialPlan.financialSummary.trim() || sections.financialPlan.fundingRequired > 0) fin += 50
    if (sections.financialPlan.useOfFunds.length > 0 || sections.financialPlan.breakEvenCommentary.trim()) fin += 50
    scores.financialPlan = fin

    return scores
  }

  private calculateOverallCompletion(sectionCompletion: Record<string, number>): number {
    const values = Object.values(sectionCompletion)
    if (values.length === 0) return 0
    const total = values.reduce((sum, val) => sum + val, 0)
    return Math.round(total / values.length)
  }

  private toResponse(
    projectId: string,
    record: { sections: Prisma.JsonValue; completion: number; updatedAt: Date | null; updatedById: string | null }
  ): BpResponse {
    const sections = this.normalizeSections(record.sections, null)
    const sectionCompletion = this.calculateSectionCompletions(sections)
    const completion = this.calculateOverallCompletion(sectionCompletion)

    return {
      projectId,
      sections,
      sectionCompletion,
      completion,
      updatedAt: record.updatedAt,
      updatedById: record.updatedById,
    }
  }
}
