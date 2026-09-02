import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Calculator,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import {
  financeResponseSchema,
  type FinanceResponse,
  type FinanceInvestmentItem,
  type FinanceRevenueStream,
  type FinanceFixedCost,
  type FinanceVariableCost,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'

export default function ProjectFinancesPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [finance, setFinance] = useState<FinanceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    apiClient
      .get(`/projects/${id}/finances`, financeResponseSchema)
      .then((data) => {
        if (active) setFinance(data)
      })
      .catch(() => {
        if (active) setError('Impossible de charger les données financières.')
      })
    return () => {
      active = false
    }
  }, [id])

  const saveFinancePatch = useCallback(
    async (patch: Partial<FinanceResponse>) => {
      if (!finance) return
      try {
        const updated = await apiClient.patch(
          `/projects/${id}/finances`,
          patch,
          financeResponseSchema
        )
        setFinance(updated)
      } catch {
        setError('Erreur lors de la sauvegarde des finances.')
      }
    },
    [id, finance]
  )

  // Handlers for Investments
  function addInvestment() {
    if (!finance) return
    const newItem: FinanceInvestmentItem = {
      id: `inv_${Date.now()}`,
      label: 'Nouvel investissement initial',
      category: 'EQUIPMENT',
      amount: 0,
    }
    const initialInvestments = [...finance.initialInvestments, newItem]
    saveFinancePatch({ initialInvestments })
  }

  function updateInvestment(index: number, field: keyof FinanceInvestmentItem, value: unknown) {
    if (!finance) return
    const initialInvestments = [...finance.initialInvestments]
    initialInvestments[index] = { ...initialInvestments[index], [field]: value } as FinanceInvestmentItem
    saveFinancePatch({ initialInvestments })
  }

  function removeInvestment(index: number) {
    if (!finance) return
    const initialInvestments = finance.initialInvestments.filter((_, i) => i !== index)
    saveFinancePatch({ initialInvestments })
  }

  // Handlers for Revenues
  function addRevenue() {
    if (!finance) return
    const newRev: FinanceRevenueStream = {
      id: `rev_${Date.now()}`,
      name: 'Nouveau produit / service',
      pricingModel: 'UNIT_SALE',
      unitPrice: 10000,
      monthlyVolumeMonth1: 20,
      monthlyVolumeMonth12: 50,
      annualGrowthPercent: 20,
    }
    const revenues = [...finance.revenues, newRev]
    saveFinancePatch({ revenues })
  }

  function updateRevenue(index: number, field: keyof FinanceRevenueStream, value: unknown) {
    if (!finance) return
    const revenues = [...finance.revenues]
    revenues[index] = { ...revenues[index], [field]: value } as FinanceRevenueStream
    saveFinancePatch({ revenues })
  }

  function removeRevenue(index: number) {
    if (!finance) return
    const revenues = finance.revenues.filter((_, i) => i !== index)
    saveFinancePatch({ revenues })
  }

  // Handlers for Fixed Costs
  function addFixedCost() {
    if (!finance) return
    const newCost: FinanceFixedCost = {
      id: `fc_${Date.now()}`,
      name: 'Nouvelle charge fixe',
      category: 'SALARIES',
      monthlyAmount: 200000,
    }
    const fixedCosts = [...finance.fixedCosts, newCost]
    saveFinancePatch({ fixedCosts })
  }

  function updateFixedCost(index: number, field: keyof FinanceFixedCost, value: unknown) {
    if (!finance) return
    const fixedCosts = [...finance.fixedCosts]
    fixedCosts[index] = { ...fixedCosts[index], [field]: value } as FinanceFixedCost
    saveFinancePatch({ fixedCosts })
  }

  function removeFixedCost(index: number) {
    if (!finance) return
    const fixedCosts = finance.fixedCosts.filter((_, i) => i !== index)
    saveFinancePatch({ fixedCosts })
  }

  // Handlers for Variable Costs
  function addVariableCost() {
    if (!finance) return
    const newVC: FinanceVariableCost = {
      id: `vc_${Date.now()}`,
      name: 'Nouvelle charge variable',
      category: 'PRODUCTION_SUPPLIES',
      costPerUnitOrPercent: 2000,
      isPercentageOfRevenue: false,
    }
    const variableCosts = [...finance.variableCosts, newVC]
    saveFinancePatch({ variableCosts })
  }

  function updateVariableCost(index: number, field: keyof FinanceVariableCost, value: unknown) {
    if (!finance) return
    const variableCosts = [...finance.variableCosts]
    variableCosts[index] = { ...variableCosts[index], [field]: value } as FinanceVariableCost
    saveFinancePatch({ variableCosts })
  }

  function removeVariableCost(index: number) {
    if (!finance) return
    const variableCosts = finance.variableCosts.filter((_, i) => i !== index)
    saveFinancePatch({ variableCosts })
  }

  const curr = finance?.currency || 'MGA'

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={id} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {/* Header */}
          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                  <Calculator className="h-3.5 w-3.5" />
                  Modélisation Financière
                </span>
                <span className="text-xs text-muted-foreground">Projections & Seuil de rentabilité</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Viabilité économique du projet
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Modélisez vos revenus, vos charges et calculez automatiquement votre point mort (seuil de rentabilité), vos marges et votre trésorerie prévisionnelle sur 3 ans.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Currency Selector */}
              {finance && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-muted-foreground">Devise :</span>
                  <select
                    value={finance.currency}
                    onChange={(e) => saveFinancePatch({ currency: e.target.value })}
                    className="bg-transparent text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="MGA">MGA (Ariary)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
          </header>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
              {error}
            </div>
          )}

          {finance && (
            <div className="space-y-8">
              {/* INDICATORS & RELIABILITY CARDS */}
              <section className="space-y-4" aria-label="Indicateurs clés">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground">Indicateurs de viabilité</h2>
                  {finance.indicators.isReliable ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Hypothèses complètes & fiables
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> Données partielles
                    </span>
                  )}
                </div>

                {!finance.indicators.isReliable && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-300">
                    <p className="font-bold">Pour fiabiliser les calculs, veuillez renseigner :</p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      {finance.indicators.missingDataReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Point Mort / Seuil de rentabilité mensuel */}
                  <Card className="rounded-2xl border-border bg-card p-5 shadow-2xs">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Seuil de rentabilité mensuel
                    </CardDescription>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-2xl font-black text-foreground">
                        {finance.indicators.monthlyBreakEvenRevenue !== null
                          ? `${finance.indicators.monthlyBreakEvenRevenue.toLocaleString('fr-FR')} ${curr}`
                          : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      CA mensuel minimum pour couvrir 100% des charges fixes
                    </p>
                  </Card>

                  {/* Marge brute */}
                  <Card className="rounded-2xl border-border bg-card p-5 shadow-2xs">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Taux de marge brute
                    </CardDescription>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-2xl font-black text-primary">
                        {finance.indicators.grossMarginPercent !== null
                          ? `${finance.indicators.grossMarginPercent} %`
                          : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      (Chiffre d’affaires - Charges variables) / CA
                    </p>
                  </Card>

                  {/* Charges fixes mensuelles */}
                  <Card className="rounded-2xl border-border bg-card p-5 shadow-2xs">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Charges fixes mensuelles
                    </CardDescription>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-2xl font-black text-foreground">
                        {finance.indicators.monthlyFixedCostsTotal.toLocaleString('fr-FR')} {curr}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Coûts récurrents incompressibles par mois
                    </p>
                  </Card>

                  {/* Runway / Burn rate */}
                  <Card className="rounded-2xl border-border bg-card p-5 shadow-2xs">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Autonomie (Runway)
                    </CardDescription>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-2xl font-black text-foreground">
                        {finance.indicators.runwayMonths === 999
                          ? 'Rentable 🚀'
                          : finance.indicators.runwayMonths !== null
                          ? `${finance.indicators.runwayMonths} mois`
                          : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {finance.indicators.monthlyBurnRate && finance.indicators.monthlyBurnRate > 0
                        ? `Burn rate : ${finance.indicators.monthlyBurnRate.toLocaleString('fr-FR')} ${curr}/mois`
                        : 'Activité rentable sans besoin de trésorerie d’urgence'}
                    </p>
                  </Card>
                </div>
              </section>

              {/* MULTI-YEAR PROJECTIONS TABLE */}
              <section className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4" aria-label="Compte de résultat prévisionnel">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Projections financières sur 3 ans</h2>
                    <p className="text-xs text-muted-foreground">
                      Calcul automatique basé sur vos hypothèses de volumes, prix unitaires, coûts et taux de croissance.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="py-2.5 pr-4 font-bold">Poste ({curr})</th>
                        {finance.calculatedForecast.map((fc) => (
                          <th key={fc.year} className="py-2.5 px-4 text-right font-bold">
                            Année {fc.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <tr>
                        <td className="py-2.5 pr-4 font-bold text-foreground">Chiffre d’affaires total (Revenus)</td>
                        {finance.calculatedForecast.map((fc) => (
                          <td key={fc.year} className="py-2.5 px-4 text-right font-bold text-foreground">
                            {fc.revenue.toLocaleString('fr-FR')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">Charges variables de production (COGS)</td>
                        {finance.calculatedForecast.map((fc) => (
                          <td key={fc.year} className="py-2.5 px-4 text-right text-muted-foreground">
                            - {fc.cogsVariableCosts.toLocaleString('fr-FR')}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="py-2.5 pr-4 font-bold text-primary">Marge Brute (Taux %)</td>
                        {finance.calculatedForecast.map((fc) => (
                          <td key={fc.year} className="py-2.5 px-4 text-right font-bold text-primary">
                            {fc.grossMargin.toLocaleString('fr-FR')} ({fc.grossMarginPercent}%)
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">Charges fixes d’exploitation</td>
                        {finance.calculatedForecast.map((fc) => (
                          <td key={fc.year} className="py-2.5 px-4 text-right text-muted-foreground">
                            - {fc.fixedCosts.toLocaleString('fr-FR')}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="py-2.5 pr-4 font-bold text-foreground">Résultat Net d'Exploitation (Marge %)</td>
                        {finance.calculatedForecast.map((fc) => (
                          <td
                            key={fc.year}
                            className={`py-2.5 px-4 text-right font-bold ${
                              fc.netResult >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                            }`}
                          >
                            {fc.netResult.toLocaleString('fr-FR')} ({fc.netMarginPercent}%)
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t-2 border-border font-bold">
                        <td className="py-2.5 pr-4 text-foreground">Trésorerie cumulée fin d'année</td>
                        {finance.calculatedForecast.map((fc) => (
                          <td
                            key={fc.year}
                            className={`py-2.5 px-4 text-right ${
                              fc.endingCash >= 0 ? 'text-foreground' : 'text-destructive'
                            }`}
                          >
                            {fc.endingCash.toLocaleString('fr-FR')}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* EDITABLE HYPOTHESES: REVENUES & COSTS */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. REVENUE STREAMS */}
                <Card className="rounded-2xl border-border bg-card shadow-2xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-bold">1. Flux de Revenus</CardTitle>
                      <CardDescription className="text-xs">
                        Sources de monétisation, prix unitaire et volumes prévisionnels.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={addRevenue} className="h-7 text-xs gap-1">
                      <Plus className="h-3 w-3" /> Ajouter un flux
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {finance.revenues.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-3 text-center">
                        Aucun flux de revenus défini. Cliquez sur « Ajouter un flux ».
                      </p>
                    )}
                    {finance.revenues.map((rev, idx) => (
                      <div key={rev.id} className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={rev.name}
                            onChange={(e) => updateRevenue(idx, 'name', e.target.value)}
                            className="h-7 text-xs font-bold bg-background"
                          />
                          <select
                            value={rev.pricingModel}
                            onChange={(e) => updateRevenue(idx, 'pricingModel', e.target.value)}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-[11px]"
                          >
                            <option value="UNIT_SALE">Vente à l'unité</option>
                            <option value="SUBSCRIPTION">Abonnement</option>
                            <option value="COMMISSION_PERCENT">Commission</option>
                            <option value="SERVICE_FEE">Frais de service</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRevenue(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground">Prix ({curr})</span>
                            <Input
                              type="number"
                              value={rev.unitPrice}
                              onChange={(e) => updateRevenue(idx, 'unitPrice', Number(e.target.value))}
                              className="h-7 text-xs bg-background"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground">Vol. Mois 1</span>
                            <Input
                              type="number"
                              value={rev.monthlyVolumeMonth1}
                              onChange={(e) => updateRevenue(idx, 'monthlyVolumeMonth1', Number(e.target.value))}
                              className="h-7 text-xs bg-background"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground">Croissance annuelle %</span>
                            <Input
                              type="number"
                              value={rev.annualGrowthPercent}
                              onChange={(e) => updateRevenue(idx, 'annualGrowthPercent', Number(e.target.value))}
                              className="h-7 text-xs bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 2. FIXED COSTS */}
                <Card className="rounded-2xl border-border bg-card shadow-2xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-bold">2. Charges Fixes Récurrentes</CardTitle>
                      <CardDescription className="text-xs">
                        Salaires, locaux, abonnements logiciels, administration.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={addFixedCost} className="h-7 text-xs gap-1">
                      <Plus className="h-3 w-3" /> Ajouter un coût
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {finance.fixedCosts.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-3 text-center">
                        Aucune charge fixe renseignée.
                      </p>
                    )}
                    {finance.fixedCosts.map((cost, idx) => (
                      <div key={cost.id} className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={cost.name}
                            onChange={(e) => updateFixedCost(idx, 'name', e.target.value)}
                            className="h-7 text-xs font-bold bg-background"
                          />
                          <select
                            value={cost.category}
                            onChange={(e) => updateFixedCost(idx, 'category', e.target.value)}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-[11px]"
                          >
                            <option value="SALARIES">Salaires / Rémunérations</option>
                            <option value="SOFTWARE_TOOLS">Outils & Hébergement</option>
                            <option value="RENT_OFFICE">Bureaux / Locaux</option>
                            <option value="COMMUNICATION_INTERNET">Télécoms / Internet</option>
                            <option value="MARKETING_RECURRENT">Marketing récurrent</option>
                            <option value="OTHER">Autre</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFixedCost(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground">Montant mensuel ({curr})</span>
                          <Input
                            type="number"
                            value={cost.monthlyAmount}
                            onChange={(e) => updateFixedCost(idx, 'monthlyAmount', Number(e.target.value))}
                            className="h-7 text-xs bg-background"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 3. VARIABLE COSTS */}
                <Card className="rounded-2xl border-border bg-card shadow-2xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-bold">3. Charges Variables Unitaires</CardTitle>
                      <CardDescription className="text-xs">
                        Matières premières, livraison, commissions et coût d'acquisition.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={addVariableCost} className="h-7 text-xs gap-1">
                      <Plus className="h-3 w-3" /> Ajouter un coût
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {finance.variableCosts.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-3 text-center">
                        Aucune charge variable renseignée.
                      </p>
                    )}
                    {finance.variableCosts.map((vc, idx) => (
                      <div key={vc.id} className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={vc.name}
                            onChange={(e) => updateVariableCost(idx, 'name', e.target.value)}
                            className="h-7 text-xs font-bold bg-background"
                          />
                          <select
                            value={vc.category}
                            onChange={(e) => updateVariableCost(idx, 'category', e.target.value)}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-[11px]"
                          >
                            <option value="PRODUCTION_SUPPLIES">Fournitures / Production</option>
                            <option value="PACKAGING_SHIPPING">Livraison & Emballage</option>
                            <option value="TRANSACTION_FEES">Frais Mobile Money</option>
                            <option value="CUSTOMER_ACQUISITION">Acquisition client (CAC)</option>
                            <option value="OTHER">Autre</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariableCost(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground">Coût unitaire ou %</span>
                            <Input
                              type="number"
                              value={vc.costPerUnitOrPercent}
                              onChange={(e) => updateVariableCost(idx, 'costPerUnitOrPercent', Number(e.target.value))}
                              className="h-7 text-xs bg-background"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-4">
                            <input
                              type="checkbox"
                              id={`isPct_${vc.id}`}
                              checked={vc.isPercentageOfRevenue}
                              onChange={(e) => updateVariableCost(idx, 'isPercentageOfRevenue', e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor={`isPct_${vc.id}`} className="text-[11px] text-foreground">
                              En % du prix de vente
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 4. INITIAL INVESTMENTS */}
                <Card className="rounded-2xl border-border bg-card shadow-2xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-bold">4. Investissements Initiaux & Trésorerie</CardTitle>
                      <CardDescription className="text-xs">
                        Matériel de départ, développement, trésorerie de départ.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={addInvestment} className="h-7 text-xs gap-1">
                      <Plus className="h-3 w-3" /> Ajouter un investissement
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1 text-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Trésorerie / Apport de départ disponible ({curr})
                      </label>
                      <Input
                        type="number"
                        value={finance.startingCash}
                        onChange={(e) => saveFinancePatch({ startingCash: Number(e.target.value) })}
                        className="h-8 bg-background font-bold text-xs"
                      />
                    </div>

                    {finance.initialInvestments.map((item, idx) => (
                      <div key={item.id} className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={item.label}
                            onChange={(e) => updateInvestment(idx, 'label', e.target.value)}
                            className="h-7 text-xs font-bold bg-background"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvestment(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground">Montant ({curr})</span>
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateInvestment(idx, 'amount', Number(e.target.value))}
                            className="h-7 text-xs bg-background"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
