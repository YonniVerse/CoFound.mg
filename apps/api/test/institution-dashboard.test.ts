import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { InstitutionDashboardService } from '../src/institution/institution-dashboard.service.js'
import { InstitutionDashboardController } from '../src/institution/institution-dashboard.controller.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'
import { MIN_AGGREGATION_THRESHOLD } from '@cofound/shared'

const mockOrg = { id: 'org_1', name: 'Université d’Antananarivo', type: 'INSTITUTION' }
const mockAdminMember = { id: 'om_1', organizationId: 'org_1', userId: 'u_admin', role: 'ORG_ADMIN', organization: mockOrg }
const mockViewerMember = { id: 'om_2', organizationId: 'org_1', userId: 'u_viewer', role: 'ORG_VIEWER', organization: mockOrg }

test('DASH-01 calcule correctement les KPIs étudiants, profils, entonnoir et projets', async () => {
  const affiliations = [
    {
      userId: 'u_s1',
      organizationId: 'org_1',
      status: 'ACTIVE',
      user: {
        id: 'u_s1',
        email: 's1@univ.mg',
        status: 'ACTIVE',
        lastLoginAt: new Date(),
        talentProfile: { completion: 80, fieldId: 'f_cs' },
        projectMembers: [{ projectId: 'prj_1' }],
      },
    },
    {
      userId: 'u_s2',
      organizationId: 'org_1',
      status: 'ACTIVE',
      user: {
        id: 'u_s2',
        email: 's2@univ.mg',
        status: 'ACTIVE',
        lastLoginAt: new Date(),
        talentProfile: { completion: 70, fieldId: 'f_bus' },
        projectMembers: [{ projectId: 'prj_1' }],
      },
    },
    {
      userId: 'u_s3',
      organizationId: 'org_1',
      status: 'INVITED',
      user: {
        id: 'u_s3',
        email: 's3@univ.mg',
        status: 'INVITED',
        lastLoginAt: null,
        talentProfile: null,
        projectMembers: [],
      },
    },
  ]

  const projects = [
    {
      id: 'prj_1',
      title: 'EduTech Mada',
      status: 'ACTIVE',
      createdById: 'u_s1',
      createdAt: new Date(),
      sector: { id: 'sec_tech', slug: 'technologie', labelKey: 'sector.tech' },
      posts: [{ type: 'SEEKING_MENTORSHIP' }],
      members: [
        { userId: 'u_s1', role: 'OWNER', user: { talentProfile: { fieldId: 'f_cs' } } },
        { userId: 'u_s2', role: 'MEMBER', user: { talentProfile: { fieldId: 'f_bus' } } },
      ],
    },
  ]

  const prisma = {
    organizationMember: {
      findMany: async () => [mockAdminMember],
    },
    affiliation: {
      findMany: async () => affiliations,
    },
    importRow: {
      count: async () => 3,
    },
    invitationToken: {
      count: async () => 3,
    },
    project: {
      findMany: async () => projects,
    },
    application: {
      count: async () => 2,
    },
    opportunityApplication: {
      count: async () => 1,
    },
    financialEngagement: {
      count: async () => 1,
    },
    opportunity: {
      count: async () => 1,
    },
  } as unknown as PrismaService

  const service = new InstitutionDashboardService(prisma)
  const dashboard = await service.getDashboard('u_admin', 'org_1')

  assert.equal(dashboard.organization.id, 'org_1')
  assert.equal(dashboard.organization.role, 'ORG_ADMIN')
  assert.equal(dashboard.organization.canManage, true)

  // Students KPIs
  assert.equal(dashboard.students.total, 3)
  assert.equal(dashboard.students.active, 2)
  assert.equal(dashboard.students.invited, 1)
  assert.equal(dashboard.students.unactivated, 1)

  // Profiles KPIs
  assert.equal(dashboard.profiles.completed, 2)
  assert.ok(dashboard.profiles.averageCompletionPercent >= 50)

  // Funnel
  assert.equal(dashboard.funnel.accountsActivated, 2)
  assert.equal(dashboard.funnel.activationRatePercent, 67)
  assert.equal(dashboard.funnel.completionRatePercent, 100)

  // Projects
  assert.equal(dashboard.projects.total, 1)
  assert.equal(dashboard.projects.active, 1)
  assert.equal(dashboard.projects.seekingMentorship, 1)

  // Multidisciplinarity (f_cs + f_bus)
  assert.equal(dashboard.multidisciplinarity.multidisciplinaryProjectsCount, 1)
  assert.equal(dashboard.multidisciplinarity.multidisciplinaryRatePercent, 100)

  // Sectors
  assert.equal(dashboard.sectorsDistribution.length, 1)
  assert.equal(dashboard.sectorsDistribution[0]?.slug, 'technologie')

  // Confidentiality
  assert.equal(dashboard.confidentiality.minAggregationThreshold, MIN_AGGREGATION_THRESHOLD)
  assert.equal(dashboard.confidentiality.genderBreakdownMasked, true)
})

test('DASH-02 gère les cas particuliers : institution sans étudiant', async () => {
  const prisma = {
    organizationMember: {
      findMany: async () => [mockViewerMember],
    },
    affiliation: {
      findMany: async () => [],
    },
    importRow: {
      count: async () => 0,
    },
    invitationToken: {
      count: async () => 0,
    },
    project: {
      findMany: async () => [],
    },
    application: {
      count: async () => 0,
    },
    opportunityApplication: {
      count: async () => 0,
    },
    financialEngagement: {
      count: async () => 0,
    },
    opportunity: {
      count: async () => 0,
    },
  } as unknown as PrismaService

  const service = new InstitutionDashboardService(prisma)
  const dashboard = await service.getDashboard('u_viewer')

  assert.equal(dashboard.students.total, 0)
  assert.equal(dashboard.students.active, 0)
  assert.equal(dashboard.funnel.activationRatePercent, 0)
  assert.equal(dashboard.profiles.averageCompletionPercent, 0)
  assert.equal(dashboard.projects.total, 0)
  assert.equal(dashboard.sectorsDistribution.length, 0)
  assert.equal(dashboard.multidisciplinarity.multidisciplinaryProjectsCount, 0)
})

test('DASH-03 refuse l’accès aux utilisateurs non membres de l’institution', async () => {
  const prisma = {
    organizationMember: {
      findMany: async () => [],
    },
  } as unknown as PrismaService

  const service = new InstitutionDashboardService(prisma)
  await assert.rejects(
    () => service.getDashboard('u_intruder', 'org_1'),
    (err: unknown) => err instanceof Error && JSON.stringify(err).includes('notMember')
  )
})

test('DASH-04 refuse l’accès si l’organisation demandée n’appartient pas à l’utilisateur', async () => {
  const prisma = {
    organizationMember: {
      findMany: async () => [mockAdminMember], // Member of org_1 only
    },
  } as unknown as PrismaService

  const service = new InstitutionDashboardService(prisma)
  await assert.rejects(
    () => service.getDashboard('u_admin', 'org_other'),
    (err: unknown) => err instanceof Error && JSON.stringify(err).includes('accessDenied')
  )
})

test('DASH-05 vérifie la protection RBAC du contrôleur de dashboard', () => {
  assert.deepEqual(
    Reflect.getMetadata(PERMISSIONS_KEY, InstitutionDashboardController.prototype.getDashboard),
    [Permission.ORG_READ]
  )
})
