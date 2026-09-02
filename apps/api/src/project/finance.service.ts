import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  type FinanceFixedCost,
  type FinanceForecastYear,
  type FinanceIndicators,
  type FinanceInvestmentItem,
  type FinancePatchInput,
  type FinanceResponse,
  type FinanceRevenueStream,
  type FinanceVariableCost,
} from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class FinanceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async get(actorId: string, projectId: string): Promise<FinanceResponse> {
    await this.assertMember(actorId, projectId)
    const record = await this.prisma.projectFinance.findUnique({ where: { projectId } })

    if (!record) {
      const defaultCurrency = 'MGA'
      const initialInvestments: FinanceInvestmentItem[] = []
      const revenues: FinanceRevenueStream[] = []
      const fixedCosts: FinanceFixedCost[] = []
      const variableCosts: FinanceVariableCost[] = []
      const startingCash = 0
      const projectionYears = 3

      const { forecast, indicators, completion } = this.calculateProjections({
        currency: defaultCurrency,
        startingCash,
        projectionYears,
        initialInvestments,
        revenues,
        fixedCosts,
        variableCosts,
      })

      return {
        projectId,
        currency: defaultCurrency,
        startingCash,
        projectionYears,
        initialInvestments,
        revenues,
        fixedCosts,
        variableCosts,
        calculatedForecast: forecast,
        indicators,
        completion,
        updatedAt: null,
        updatedById: null,
      }
    }

    return this.toResponse(projectId, record)
  }

  async patch(actorId: string, projectId: string, input: FinancePatchInput): Promise<FinanceResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.projectFinance.findUnique({ where: { projectId } })

      const currency = input.currency?.trim().toUpperCase() || current?.currency || 'MGA'
      const startingCash = typeof input.startingCash === 'number' ? Math.max(0, input.startingCash) : (current?.startingCash ?? 0)
      const projectionYears = typeof input.projectionYears === 'number' ? Math.min(5, Math.max(1, input.projectionYears)) : (current?.projectionYears ?? 3)

      const initialInvestments: FinanceInvestmentItem[] = input.initialInvestments !== undefined
        ? input.initialInvestments
        : this.normalizeInvestments(current?.initialInvestments)

      const revenues: FinanceRevenueStream[] = input.revenues !== undefined
        ? input.revenues
        : this.normalizeRevenues(current?.revenues)

      const fixedCosts: FinanceFixedCost[] = input.fixedCosts !== undefined
        ? input.fixedCosts
        : this.normalizeFixedCosts(current?.fixedCosts)

      const variableCosts: FinanceVariableCost[] = input.variableCosts !== undefined
        ? input.variableCosts
        : this.normalizeVariableCosts(current?.variableCosts)

      const { forecast, indicators, completion } = this.calculateProjections({
        currency,
        startingCash,
        projectionYears,
        initialInvestments,
        revenues,
        fixedCosts,
        variableCosts,
      })

      const saved = await transaction.projectFinance.upsert({
        where: { projectId },
        create: {
          projectId,
          currency,
          startingCash,
          projectionYears,
          initialInvestments: initialInvestments as unknown as Prisma.InputJsonValue,
          revenues: revenues as unknown as Prisma.InputJsonValue,
          fixedCosts: fixedCosts as unknown as Prisma.InputJsonValue,
          variableCosts: variableCosts as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
        update: {
          currency,
          startingCash,
          projectionYears,
          initialInvestments: initialInvestments as unknown as Prisma.InputJsonValue,
          revenues: revenues as unknown as Prisma.InputJsonValue,
          fixedCosts: fixedCosts as unknown as Prisma.InputJsonValue,
          variableCosts: variableCosts as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
      })

      return {
        projectId,
        currency: saved.currency,
        startingCash: saved.startingCash,
        projectionYears: saved.projectionYears,
        initialInvestments,
        revenues,
        fixedCosts,
        variableCosts,
        calculatedForecast: forecast,
        indicators,
        completion,
        updatedAt: saved.updatedAt,
        updatedById: saved.updatedById,
      }
    })
  }

  calculateProjections(params: {
    currency: string
    startingCash: number
    projectionYears: number
    initialInvestments: FinanceInvestmentItem[]
    revenues: FinanceRevenueStream[]
    fixedCosts: FinanceFixedCost[]
    variableCosts: FinanceVariableCost[]
  }): { forecast: FinanceForecastYear[]; indicators: FinanceIndicators; completion: number } {
    const { startingCash, projectionYears, initialInvestments, revenues, fixedCosts, variableCosts } = params

    const totalInitialInvestment = initialInvestments.reduce((sum, item) => sum + (item.amount || 0), 0)
    const monthlyFixedTotal = fixedCosts.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0)
    const annualFixedTotalYear1 = monthlyFixedTotal * 12

    // Year 1 Revenue & Volume
    let year1Revenue = 0
    let year1Units = 0

    for (const rev of revenues) {
      const p = rev.unitPrice || 0
      const v1 = rev.monthlyVolumeMonth1 || 0
      const v12 = typeof rev.monthlyVolumeMonth12 === 'number' ? rev.monthlyVolumeMonth12 : v1

      let streamRev = 0
      let streamUnits = 0
      for (let m = 1; m <= 12; m++) {
        const factor = m === 1 ? 0 : (m - 1) / 11
        const monthVol = v1 + (v12 - v1) * factor
        streamUnits += monthVol
        streamRev += monthVol * p
      }
      year1Revenue += streamRev
      year1Units += streamUnits
    }

    // Year 1 Variable Costs
    let year1VariableCosts = 0
    for (const vc of variableCosts) {
      if (vc.isPercentageOfRevenue) {
        year1VariableCosts += year1Revenue * ((vc.costPerUnitOrPercent || 0) / 100)
      } else {
        year1VariableCosts += year1Units * (vc.costPerUnitOrPercent || 0)
      }
    }

    // Reliability Assessment
    const missingDataReasons: string[] = []
    if (revenues.length === 0) missingDataReasons.push('Aucun flux de revenus défini.')
    else if (year1Revenue === 0) missingDataReasons.push('Le chiffre d’affaires prévisionnel de l’année 1 est nul.')
    if (fixedCosts.length === 0) missingDataReasons.push('Aucune charge fixe renseignée.')
    if (variableCosts.length === 0 && revenues.length > 0) missingDataReasons.push('Aucune charge variable renseignée (marge brute égale à 100%).')

    const isReliable = revenues.length > 0 && year1Revenue > 0 && fixedCosts.length > 0

    // Multi-Year Forecast Table
    const forecast: FinanceForecastYear[] = []
    let currentCash = startingCash - totalInitialInvestment

    const avgAnnualGrowth = revenues.length > 0
      ? revenues.reduce((s, r) => s + (r.annualGrowthPercent ?? 15), 0) / revenues.length
      : 15

    for (let y = 1; y <= projectionYears; y++) {
      const growthFactor = y === 1 ? 1 : Math.pow(1 + avgAnnualGrowth / 100, y - 1)
      const fixedInflationFactor = y === 1 ? 1 : Math.pow(1.05, y - 1) // +5% annual scale for fixed costs

      const yearRevenue = Math.round(year1Revenue * growthFactor)
      const yearVarCosts = Math.round(year1VariableCosts * growthFactor)
      const yearGrossMargin = yearRevenue - yearVarCosts
      const yearGrossMarginPct = yearRevenue > 0 ? Number(((yearGrossMargin / yearRevenue) * 100).toFixed(1)) : 0

      const yearFixedCosts = Math.round(annualFixedTotalYear1 * fixedInflationFactor)
      const yearEbitda = yearGrossMargin - yearFixedCosts
      const yearNetResult = yearEbitda // Student model simplified net result
      const yearNetMarginPct = yearRevenue > 0 ? Number(((yearNetResult / yearRevenue) * 100).toFixed(1)) : 0

      currentCash += yearNetResult

      forecast.push({
        year: y,
        revenue: yearRevenue,
        cogsVariableCosts: yearVarCosts,
        grossMargin: yearGrossMargin,
        grossMarginPercent: yearGrossMarginPct,
        fixedCosts: yearFixedCosts,
        operatingResultEbitda: yearEbitda,
        netResult: yearNetResult,
        netMarginPercent: yearNetMarginPct,
        endingCash: Math.round(currentCash),
      })
    }

    // Indicators calculation
    const grossMarginPercent = year1Revenue > 0 ? Number((((year1Revenue - year1VariableCosts) / year1Revenue) * 100).toFixed(1)) : null
    const netMarginPercent = year1Revenue > 0 ? Number((((year1Revenue - year1VariableCosts - annualFixedTotalYear1) / year1Revenue) * 100).toFixed(1)) : null

    const contributionMarginRatio = year1Revenue > 0 ? (year1Revenue - year1VariableCosts) / year1Revenue : 0
    const monthlyBreakEvenRevenue = isReliable && contributionMarginRatio > 0 ? Math.round(monthlyFixedTotal / contributionMarginRatio) : null
    const annualBreakEvenRevenue = monthlyBreakEvenRevenue !== null ? monthlyBreakEvenRevenue * 12 : null

    // Burn rate & Runway
    const monthlyAverageNetResultYear1 = (year1Revenue - year1VariableCosts - annualFixedTotalYear1) / 12
    const monthlyBurnRate = monthlyAverageNetResultYear1 < 0 ? Math.round(Math.abs(monthlyAverageNetResultYear1)) : 0

    let runwayMonths: number | null = null
    const totalAvailableCash = startingCash
    if (monthlyBurnRate > 0) {
      runwayMonths = totalAvailableCash > 0 ? Number((totalAvailableCash / monthlyBurnRate).toFixed(1)) : 0
    } else if (isReliable) {
      runwayMonths = 999 // Self-sustaining
    }

    // CAC estimation
    let estimatedCac: number | null = null
    const marketingCosts = fixedCosts.filter((c) => c.category === 'MARKETING_RECURRENT').reduce((s, c) => s + c.monthlyAmount * 12, 0) +
      variableCosts.filter((v) => v.category === 'CUSTOMER_ACQUISITION').reduce((s, v) => s + (v.isPercentageOfRevenue ? year1Revenue * (v.costPerUnitOrPercent / 100) : year1Units * v.costPerUnitOrPercent), 0)

    if (marketingCosts > 0 && year1Units > 0) {
      estimatedCac = Math.round(marketingCosts / year1Units)
    }

    // LTV estimation (Price / unit * avg transactions or gross margin per customer)
    let estimatedLtv: number | null = null
    if (isReliable && year1Units > 0) {
      const avgGrossMarginPerUnit = (year1Revenue - year1VariableCosts) / year1Units
      estimatedLtv = Math.round(avgGrossMarginPerUnit * 1.5)
    }

    const indicators: FinanceIndicators = {
      isReliable,
      missingDataReasons,
      grossMarginPercent,
      netMarginPercent,
      monthlyFixedCostsTotal: monthlyFixedTotal,
      monthlyBreakEvenRevenue,
      annualBreakEvenRevenue,
      monthlyBurnRate: isReliable ? monthlyBurnRate : null,
      runwayMonths: isReliable ? runwayMonths : null,
      estimatedCac,
      estimatedLtv,
    }

    // Completion score
    let compPoints = 0
    if (revenues.length > 0) compPoints += 30
    if (fixedCosts.length > 0) compPoints += 30
    if (variableCosts.length > 0) compPoints += 20
    if (initialInvestments.length > 0 || startingCash > 0) compPoints += 20
    const completion = Math.min(100, compPoints)

    return { forecast, indicators, completion }
  }

  private async assertMember(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, members: { where: { userId: actorId, leftAt: null }, select: { id: true, role: true } } },
    })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Accès au projet refusé.')
  }

  private normalizeInvestments(raw: Prisma.JsonValue | null | undefined): FinanceInvestmentItem[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item, idx) => {
      const r = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      return {
        id: typeof r.id === 'string' ? r.id : `inv_${idx + 1}`,
        label: typeof r.label === 'string' ? r.label : 'Investissement',
        category: (['EQUIPMENT', 'DEVELOPMENT', 'MARKETING_LAUNCH', 'WORKING_CAPITAL', 'LEGAL_ADMIN', 'OTHER'].includes(r.category as string) ? r.category : 'OTHER') as FinanceInvestmentItem['category'],
        amount: typeof r.amount === 'number' ? Math.max(0, r.amount) : 0,
      }
    })
  }

  private normalizeRevenues(raw: Prisma.JsonValue | null | undefined): FinanceRevenueStream[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item, idx) => {
      const r = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      return {
        id: typeof r.id === 'string' ? r.id : `rev_${idx + 1}`,
        name: typeof r.name === 'string' ? r.name : `Produit / Service ${idx + 1}`,
        pricingModel: (['UNIT_SALE', 'SUBSCRIPTION', 'COMMISSION_PERCENT', 'SERVICE_FEE', 'OTHER'].includes(r.pricingModel as string) ? r.pricingModel : 'UNIT_SALE') as FinanceRevenueStream['pricingModel'],
        unitPrice: typeof r.unitPrice === 'number' ? Math.max(0, r.unitPrice) : 0,
        monthlyVolumeMonth1: typeof r.monthlyVolumeMonth1 === 'number' ? Math.max(0, r.monthlyVolumeMonth1) : 0,
        monthlyVolumeMonth12: typeof r.monthlyVolumeMonth12 === 'number' ? Math.max(0, r.monthlyVolumeMonth12) : undefined,
        annualGrowthPercent: typeof r.annualGrowthPercent === 'number' ? r.annualGrowthPercent : 15,
      }
    })
  }

  private normalizeFixedCosts(raw: Prisma.JsonValue | null | undefined): FinanceFixedCost[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item, idx) => {
      const r = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      return {
        id: typeof r.id === 'string' ? r.id : `fc_${idx + 1}`,
        name: typeof r.name === 'string' ? r.name : `Charge fixe ${idx + 1}`,
        category: (['SALARIES', 'SOFTWARE_TOOLS', 'RENT_OFFICE', 'COMMUNICATION_INTERNET', 'TRANSPORT', 'ACCOUNTING_LEGAL', 'MARKETING_RECURRENT', 'OTHER'].includes(r.category as string) ? r.category : 'OTHER') as FinanceFixedCost['category'],
        monthlyAmount: typeof r.monthlyAmount === 'number' ? Math.max(0, r.monthlyAmount) : 0,
      }
    })
  }

  private normalizeVariableCosts(raw: Prisma.JsonValue | null | undefined): FinanceVariableCost[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item, idx) => {
      const r = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      return {
        id: typeof r.id === 'string' ? r.id : `vc_${idx + 1}`,
        name: typeof r.name === 'string' ? r.name : `Charge variable ${idx + 1}`,
        category: (['PRODUCTION_SUPPLIES', 'PACKAGING_SHIPPING', 'TRANSACTION_FEES', 'CUSTOMER_ACQUISITION', 'COMMISSIONS', 'OTHER'].includes(r.category as string) ? r.category : 'OTHER') as FinanceVariableCost['category'],
        costPerUnitOrPercent: typeof r.costPerUnitOrPercent === 'number' ? Math.max(0, r.costPerUnitOrPercent) : 0,
        isPercentageOfRevenue: r.isPercentageOfRevenue === true,
      }
    })
  }

  private toResponse(
    projectId: string,
    record: {
      currency: string
      startingCash: number
      projectionYears: number
      initialInvestments: Prisma.JsonValue
      revenues: Prisma.JsonValue
      fixedCosts: Prisma.JsonValue
      variableCosts: Prisma.JsonValue
      completion: number
      updatedAt: Date | null
      updatedById: string | null
    }
  ): FinanceResponse {
    const initialInvestments = this.normalizeInvestments(record.initialInvestments)
    const revenues = this.normalizeRevenues(record.revenues)
    const fixedCosts = this.normalizeFixedCosts(record.fixedCosts)
    const variableCosts = this.normalizeVariableCosts(record.variableCosts)

    const { forecast, indicators, completion } = this.calculateProjections({
      currency: record.currency,
      startingCash: record.startingCash,
      projectionYears: record.projectionYears,
      initialInvestments,
      revenues,
      fixedCosts,
      variableCosts,
    })

    return {
      projectId,
      currency: record.currency,
      startingCash: record.startingCash,
      projectionYears: record.projectionYears,
      initialInvestments,
      revenues,
      fixedCosts,
      variableCosts,
      calculatedForecast: forecast,
      indicators,
      completion,
      updatedAt: record.updatedAt,
      updatedById: record.updatedById,
    }
  }
}
