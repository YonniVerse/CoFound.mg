import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { DesignThinkingService } from '../src/project/design-thinking.service.js'
import { DesignThinkingController } from '../src/project/design-thinking.controller.js'
import { BusinessPlanService } from '../src/project/business-plan.service.js'
import { BusinessPlanController } from '../src/project/business-plan.controller.js'
import { FinanceService } from '../src/project/finance.service.js'
import { FinanceController } from '../src/project/finance.controller.js'
import { PitchService } from '../src/project/pitch.service.js'
import { PitchController } from '../src/project/pitch.controller.js'
import { JourneyService } from '../src/project/journey.service.js'
import { JourneyController } from '../src/project/journey.controller.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'

const mockMember = { id: 'm1', role: 'OWNER', functionalRole: 'Fondateur', user: { email: 'founder@cofound.mg', talentProfile: { pseudonym: 'Fndr', headline: 'Lead', bio: 'Bio', goals: ['Tech'] }, talentIdentity: { firstName: 'Jean', lastName: 'Rakoto' } } }

// -------------------------------------------------------------
// 1. DESIGN THINKING TESTS
// -------------------------------------------------------------
test('DT-01 initialise une itération par défaut et calcule les scores', async () => {
  const prisma = {
    project: { findUnique: async () => ({ id: 'p1', title: 'AgriTech', pitch: 'Optimiser la vanille', members: [mockMember] }) },
    projectDesignThinking: { findUnique: async () => null },
  } as unknown as PrismaService

  const service = new DesignThinkingService(prisma)
  const response = await service.get('u1', 'p1')

  assert.equal(response.projectId, 'p1')
  assert.equal(response.iterations.length, 1)
  assert.equal(response.iterations[0]?.title, 'Itération 1 - Exploration initiale')
  assert.equal(response.iterations[0]?.understand.problem, 'Défi initial : Optimiser la vanille')
})

test('DT-02 enregistre les données de phase et recalcule la complétion', async () => {
  let savedData: Record<string, unknown> | undefined
  const prisma = {
    project: { findUnique: async () => ({ id: 'p1', pitch: 'Pitch', members: [mockMember] }) },
    projectDesignThinking: { findUnique: async () => null },
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
      return cb({
        project: { findUnique: async () => ({ id: 'p1', pitch: 'Pitch', members: [mockMember] }) },
        projectDesignThinking: {
          findUnique: async () => null,
          upsert: async (args: { create: Record<string, unknown> }) => {
            savedData = args.create
            return {
              projectId: 'p1',
              iterations: args.create.iterations,
              activeIterationIndex: 0,
              completion: 20,
              updatedAt: new Date(),
              updatedById: 'u1',
            }
          },
        },
      })
    },
  } as unknown as PrismaService

  const service = new DesignThinkingService(prisma)
  const res = await service.patch('u1', 'p1', {
    iterationIndex: 0,
    phase: 'understand',
    data: {
      problem: 'Gaspillage élevé des récoltes',
      targetUsers: 'Petits producteurs de la SAVA',
      context: 'Enclavement routier et coupures électriques',
    },
  })

  assert.ok(savedData)
  assert.equal(res.iterations[0]?.understand.targetUsers, 'Petits producteurs de la SAVA')
  assert.ok(res.iterations[0]?.phaseCompletion.understand ?? 0 > 0)
})

test('DT-03 protège les routes avec les permissions RBAC', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, DesignThinkingController.prototype.get), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, DesignThinkingController.prototype.patch), [Permission.PROJECT_MANAGE])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, DesignThinkingController.prototype.addIteration), [Permission.PROJECT_MANAGE])
})

// -------------------------------------------------------------
// 2. BUSINESS PLAN TESTS
// -------------------------------------------------------------
test('BP-01 initialise les 10 sections et synchronise les données amont', async () => {
  const prisma = {
    project: {
      findUnique: async () => ({
        id: 'p1',
        title: 'MadaSolar',
        pitch: 'Énergie solaire rurale',
        members: [mockMember],
        designThinking: {
          activeIterationIndex: 0,
          iterations: [
            {
              understand: { problem: 'Manque d’électricité', targetUsers: 'Villages reculés', userNeeds: ['Lumière', 'Recharge'] },
              define: { problemStatement: 'Les villageois ont besoin d’énergie propre pour étudier et travailler.' },
              prototype: { solutionDescription: 'Kits solaires avec paiement Mobile Money' },
            },
          ],
        },
        canvas: {
          blocks: {
            customerSegments: { content: 'Familles rurales' },
            valuePropositions: { content: 'Énergie propre 24h/24 sans groupe électrogène' },
            channels: { content: 'Boutiques de village' },
            revenueStreams: { content: 'Abonnement mensuel par Mobile Money' },
          },
        },
        finance: {
          currency: 'MGA',
          initialInvestments: [{ id: 'i1', label: 'Panneaux solaires', amount: 5000000 }],
        },
      }),
    },
    projectBusinessPlan: { findUnique: async () => null },
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
      return cb({
        project: {
          findUnique: async () => ({
            id: 'p1',
            title: 'MadaSolar',
            pitch: 'Énergie solaire rurale',
            members: [mockMember],
            designThinking: {
              activeIterationIndex: 0,
              iterations: [
                {
                  understand: { problem: 'Manque d’électricité', targetUsers: 'Villages reculés', userNeeds: ['Lumière', 'Recharge'] },
                  define: { problemStatement: 'Les villageois ont besoin d’énergie propre pour étudier et travailler.' },
                  prototype: { solutionDescription: 'Kits solaires avec paiement Mobile Money' },
                },
              ],
            },
            canvas: {
              blocks: {
                customerSegments: { content: 'Familles rurales' },
                valuePropositions: { content: 'Énergie propre 24h/24 sans groupe électrogène' },
                channels: { content: 'Boutiques de village' },
                revenueStreams: { content: 'Abonnement mensuel par Mobile Money' },
              },
            },
            finance: {
              currency: 'MGA',
              initialInvestments: [{ id: 'i1', label: 'Panneaux solaires', amount: 5000000 }],
            },
          }),
        },
        projectBusinessPlan: {
          findUnique: async () => null,
          upsert: async (args: { create: { sections: Record<string, unknown> } }) => ({
            projectId: 'p1',
            sections: args.create.sections,
            completion: 60,
            updatedAt: new Date(),
            updatedById: 'u1',
          }),
        },
      })
    },
  } as unknown as PrismaService

  const service = new BusinessPlanService(prisma)
  const res = await service.syncFromUpstream('u1', 'p1', false)

  assert.equal(res.sections.projectPresentation.projectName, 'MadaSolar')
  assert.equal(res.sections.marketStudy.targetMarket, 'Villages reculés')
  assert.equal(res.sections.productService.valueProposition, 'Les villageois ont besoin d’énergie propre pour étudier et travailler.')
  assert.equal(res.sections.financialPlan.fundingRequired, 5000000)
})

test('BP-02 protège les endpoints Business Plan avec RBAC', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, BusinessPlanController.prototype.get), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, BusinessPlanController.prototype.patch), [Permission.PROJECT_MANAGE])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, BusinessPlanController.prototype.sync), [Permission.PROJECT_MANAGE])
})

// -------------------------------------------------------------
// 3. FINANCE & BREAK-EVEN TESTS
// -------------------------------------------------------------
test('FIN-01 calcule la marge, le seuil de rentabilité et le compte de résultat prévisionnel', () => {
  const service = new FinanceService({} as unknown as PrismaService)

  const { forecast, indicators, completion } = service.calculateProjections({
    currency: 'MGA',
    startingCash: 2000000,
    projectionYears: 3,
    initialInvestments: [{ id: 'i1', label: 'Équipement', category: 'EQUIPMENT', amount: 1000000 }],
    revenues: [
      {
        id: 'r1',
        name: 'Produit A',
        pricingModel: 'UNIT_SALE',
        unitPrice: 50000,
        monthlyVolumeMonth1: 10,
        monthlyVolumeMonth12: 30,
        annualGrowthPercent: 20,
      },
    ],
    fixedCosts: [{ id: 'fc1', name: 'Salaires & Loyer', category: 'SALARIES', monthlyAmount: 400000 }],
    variableCosts: [{ id: 'vc1', name: 'Fournitures', category: 'PRODUCTION_SUPPLIES', costPerUnitOrPercent: 10000, isPercentageOfRevenue: false }],
  })

  assert.equal(indicators.isReliable, true)
  assert.ok(indicators.grossMarginPercent! >= 75) // (50000 - 10000) / 50000 = 80%
  assert.equal(indicators.monthlyFixedCostsTotal, 400000)
  assert.ok(indicators.monthlyBreakEvenRevenue! > 0)
  assert.equal(forecast.length, 3)
  assert.ok(forecast[0]!.revenue > 0)
  assert.ok(completion >= 70)
})

test('FIN-02 alerte lorsque des données essentielles sont absentes sans inventer de faux indicateurs', () => {
  const service = new FinanceService({} as unknown as PrismaService)

  const { indicators } = service.calculateProjections({
    currency: 'MGA',
    startingCash: 0,
    projectionYears: 3,
    initialInvestments: [],
    revenues: [], // Pas de flux de revenus
    fixedCosts: [{ id: 'fc1', name: 'Loyer', category: 'RENT_OFFICE', monthlyAmount: 300000 }],
    variableCosts: [],
  })

  assert.equal(indicators.isReliable, false)
  assert.ok(indicators.missingDataReasons.length > 0)
  assert.equal(indicators.monthlyBreakEvenRevenue, null)
})

test('FIN-03 protège les routes finances avec RBAC', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, FinanceController.prototype.get), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, FinanceController.prototype.patch), [Permission.PROJECT_MANAGE])
})

// -------------------------------------------------------------
// 4. PITCH BUILDER TESTS
// -------------------------------------------------------------
test('PITCH-01 génère 14 slides adaptées au format sélectionné', async () => {
  const prisma = {
    project: {
      findUnique: async () => ({
        id: 'p1',
        title: 'RecycleMada',
        pitch: 'Recyclage des plastiques à Antananarivo',
        members: [mockMember],
      }),
    },
    projectPitch: {
      findUnique: async () => null,
      upsert: async (args: { create: { slides: Record<string, unknown> } }) => ({
        projectId: 'p1',
        selectedFormat: 'three_minutes',
        slides: args.create.slides,
        completion: 80,
        updatedAt: new Date(),
        updatedById: 'u1',
      }),
    },
  } as unknown as PrismaService

  const service = new PitchService(prisma)
  const res = await service.generate('u1', 'p1', { format: 'three_minutes' })

  assert.equal(res.selectedFormat, 'three_minutes')
  assert.ok(res.slides.hook.isIncludedInFormat)
  assert.ok(res.slides.problem.speechScript.length > 0)
  assert.ok(res.totalEstimatedSeconds > 0)
})

test('PITCH-02 protège le Pitch Controller avec RBAC', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, PitchController.prototype.get), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, PitchController.prototype.patch), [Permission.PROJECT_MANAGE])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, PitchController.prototype.generate), [Permission.PROJECT_MANAGE])
})

// -------------------------------------------------------------
// 5. JOURNEY & MATURITY SCORING TESTS
// -------------------------------------------------------------
test('JOURNEY-01 évalue les 8 étapes, le score de maturité global et les diagnostics', async () => {
  const prisma = {
    project: {
      findUnique: async () => ({
        id: 'p1',
        title: 'BioMad',
        pitch: 'Fertilisants biologiques',
        members: [mockMember],
        designThinking: {
          activeIterationIndex: 0,
          iterations: [
            {
              phaseCompletion: { understand: 100, define: 80, ideate: 75, prototype: 60, test: 40 },
              understand: { problem: 'Sols appauvris' },
            },
          ],
        },
        canvas: {
          blocks: {
            customerSegments: { content: 'Maraîchers' },
            valuePropositions: { content: 'Engrais 100% bio' },
          },
        },
        businessPlan: { completion: 50 },
        finance: { completion: 40 },
        pitchDeck: { completion: 70 },
      }),
    },
  } as unknown as PrismaService

  const journeyService = new JourneyService(
    prisma,
    {} as unknown as BusinessPlanService,
    {} as unknown as PitchService
  )

  const res = await journeyService.get('u1', 'p1')

  assert.equal(res.projectId, 'p1')
  assert.equal(res.stages.length, 8)
  assert.ok(res.overallScore > 0 && res.overallScore <= 100)
  assert.ok(res.strengths.length > 0)
  assert.ok(res.weaknesses.length > 0)
  assert.ok(res.recommendedNextActions.length > 0)
})

test('JOURNEY-02 protège le Journey Controller avec RBAC', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, JourneyController.prototype.get), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, JourneyController.prototype.sync), [Permission.PROJECT_MANAGE])
})
