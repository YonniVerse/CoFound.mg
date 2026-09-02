import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  type CrossToolSyncRequest,
  type CrossToolSyncResponse,
  type ProjectJourneyResponse,
  type ProjectMaturityStage,
  type ProjectMaturityStageInfo,
  BMC_BLOCK_KEYS,
  type BmcBlocks,
  type DtIteration,
} from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { BusinessPlanService } from './business-plan.service.js'
import { PitchService } from './pitch.service.js'

@Injectable()
export class JourneyService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(BusinessPlanService) private readonly bpService: BusinessPlanService,
    @Inject(PitchService) private readonly pitchService: PitchService
  ) {}

  async get(actorId: string, projectId: string): Promise<ProjectJourneyResponse> {
    await this.assertMember(actorId, projectId)

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        canvas: true,
        designThinking: true,
        businessPlan: true,
        finance: true,
        pitchDeck: true,
        members: { where: { leftAt: null } },
      },
    })
    if (!project) throw new NotFoundException('Projet introuvable.')

    // 1. Evaluate Stage Completions
    const dtIterations = (project.designThinking && Array.isArray(project.designThinking.iterations))
      ? (project.designThinking.iterations as unknown as DtIteration[])
      : []
    const activeDt = dtIterations[project.designThinking?.activeIterationIndex ?? 0] || dtIterations[0]

    // Stage 1: idea
    const ideaComp = project.title.trim().length > 0 && project.pitch.trim().length > 0 ? 100 : 50
    const ideaReqs: string[] = []
    if (!project.title.trim()) ideaReqs.push('Donner un titre au projet')
    if (!project.pitch.trim()) ideaReqs.push('Décrire l’idée ou pitch initial')

    // Stage 2: problem_defined (Understand + Define)
    const understandComp = activeDt?.phaseCompletion?.understand ?? 0
    const defineComp = activeDt?.phaseCompletion?.define ?? 0
    const problemDefinedComp = Math.round((understandComp + defineComp) / 2)
    const problemReqs: string[] = []
    if (understandComp < 50) problemReqs.push('Préciser le problème, les utilisateurs cibles et réaliser au moins un entretien terrain.')
    if (defineComp < 50) problemReqs.push('Créer au moins un persona cible et formuler le problème (Problem Statement).')

    // Stage 3: solution_designed (Ideate + Prototype)
    const ideateComp = activeDt?.phaseCompletion?.ideate ?? 0
    const protoComp = activeDt?.phaseCompletion?.prototype ?? 0
    const solutionDesignedComp = Math.round((ideateComp + protoComp) / 2)
    const solutionReqs: string[] = []
    if (ideateComp < 50) solutionReqs.push('Brainstormer plusieurs idées et justifier le choix de la solution retenue.')
    if (protoComp < 50) solutionReqs.push('Décrire le prototype / MVP et lister les hypothèses critiques à tester.')

    // Stage 4: solution_tested (Test)
    const testComp = activeDt?.phaseCompletion?.test ?? 0
    const solutionTestedComp = testComp
    const testReqs: string[] = []
    if (testComp < 50) testReqs.push('Consigner les retours utilisateurs observés lors des tests et formuler une décision (Itérer, Pivoter, Persévérer).')

    // Stage 5: business_model_structured (BMC 9 blocks)
    const bmcBlocks = (project.canvas?.blocks && typeof project.canvas.blocks === 'object') ? (project.canvas.blocks as unknown as BmcBlocks) : null
    const bmcFilledCount = bmcBlocks ? BMC_BLOCK_KEYS.filter((k) => bmcBlocks[k]?.content?.trim()?.length > 0).length : 0
    const bmcComp = Math.round((bmcFilledCount / BMC_BLOCK_KEYS.length) * 100)
    const bmcReqs: string[] = []
    if (bmcComp < 100) bmcReqs.push(`Compléter les ${BMC_BLOCK_KEYS.length - bmcFilledCount} blocs manquants du Business Model Canvas.`)

    // Stage 6: business_plan_written (BP >= 70%)
    const bpComp = project.businessPlan?.completion ?? 0
    const bpReqs: string[] = []
    if (bpComp < 70) bpReqs.push('Renseigner la stratégie commerciale, l’organisation et le plan opérationnel dans le Business Plan.')

    // Stage 7: financial_viability_analyzed (Finances)
    const finComp = project.finance?.completion ?? 0
    const finReqs: string[] = []
    if (finComp < 60) finReqs.push('Définir les sources de revenus, les charges fixes et calculer le point mort / seuil de rentabilité.')

    // Stage 8: pitch_ready (Pitch Deck)
    const pitchComp = project.pitchDeck?.completion ?? 0
    const pitchReqs: string[] = []
    if (pitchComp < 70) pitchReqs.push('Finaliser le script et les notes du Pitch pour le format sélectionné.')

    const stages: ProjectMaturityStageInfo[] = [
      {
        id: 'idea',
        label: '1. Idée & Opportunité',
        description: 'Formulation claire du concept entrepreneurial et cadrage initial.',
        status: ideaComp === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completionPercent: ideaComp,
        toolRoute: `/projects/${projectId}`,
        missingRequirements: ideaReqs,
      },
      {
        id: 'problem_defined',
        label: '2. Problème Défini & Utilisateurs',
        description: 'Immersion terrain, entretiens réels, personas et formulation précise du besoin.',
        status: problemDefinedComp >= 80 ? 'COMPLETED' : problemDefinedComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: problemDefinedComp,
        toolRoute: `/projects/${projectId}/design-thinking`,
        missingRequirements: problemReqs,
      },
      {
        id: 'solution_designed',
        label: '3. Solution Conçue & Prototype',
        description: 'Brainstorming multi-solutions, choix argumenté et spécification du prototype/MVP.',
        status: solutionDesignedComp >= 80 ? 'COMPLETED' : solutionDesignedComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: solutionDesignedComp,
        toolRoute: `/projects/${projectId}/design-thinking`,
        missingRequirements: solutionReqs,
      },
      {
        id: 'solution_tested',
        label: '4. Solution Testée & Validée',
        description: 'Confrontation du prototype aux utilisateurs réels, retours et décision de pivot/itération.',
        status: solutionTestedComp >= 80 ? 'COMPLETED' : solutionTestedComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: solutionTestedComp,
        toolRoute: `/projects/${projectId}/design-thinking`,
        missingRequirements: testReqs,
      },
      {
        id: 'business_model_structured',
        label: '5. Modèle Économique Structuré',
        description: 'Les 9 blocs officiels Strategyzer pour aligner valeur, canaux, coûts et revenus.',
        status: bmcComp === 100 ? 'COMPLETED' : bmcComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: bmcComp,
        toolRoute: `/projects/${projectId}/bmc`,
        missingRequirements: bmcReqs,
      },
      {
        id: 'business_plan_written',
        label: '6. Business Plan Guidé',
        description: 'Dossier complet en 10 sections synthétisant stratégie, marché, opérations et équipe.',
        status: bpComp >= 75 ? 'COMPLETED' : bpComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: bpComp,
        toolRoute: `/projects/${projectId}/business-plan`,
        missingRequirements: bpReqs,
      },
      {
        id: 'financial_viability_analyzed',
        label: '7. Viabilité Financière Analysée',
        description: 'Modélisation des revenus, charges, projections à 3 ans et calcul du seuil de rentabilité.',
        status: finComp >= 70 ? 'COMPLETED' : finComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: finComp,
        toolRoute: `/projects/${projectId}/finances`,
        missingRequirements: finReqs,
      },
      {
        id: 'pitch_ready',
        label: '8. Pitch Prêt & Démo',
        description: 'Présentation claire et percutante adaptée aux concours, incubateurs et investisseurs.',
        status: pitchComp >= 75 ? 'COMPLETED' : pitchComp > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completionPercent: pitchComp,
        toolRoute: `/projects/${projectId}/pitch`,
        missingRequirements: pitchReqs,
      },
    ]

    const completedStagesCount = stages.filter((s) => s.status === 'COMPLETED').length
    const overallScore = Math.round(
      stages.reduce((sum, s) => sum + s.completionPercent, 0) / stages.length
    )

    // Current stage
    const firstIncomplete = stages.find((s) => s.status !== 'COMPLETED')
    const currentStageId: ProjectMaturityStage = firstIncomplete ? firstIncomplete.id : 'pitch_ready'

    // Strengths & Weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendedNextActions: Array<{
      title: string
      description: string
      targetTool: string
      targetRoute: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
    }> = []

    if (ideaComp === 100) strengths.push('Cadrage initial et titre du projet enregistrés.')
    if (problemDefinedComp >= 80) strengths.push('Problème et cible solidement définis grâce au Design Thinking.')
    else weaknesses.push('Phase de compréhension et personas encore incomplets.')

    if (solutionTestedComp >= 80) strengths.push('Tests utilisateurs documentés avec apprentissages clairs.')
    else if (solutionDesignedComp >= 50) weaknesses.push('Le prototype n’a pas encore fait l’objet de tests utilisateurs consignés.')

    if (bmcComp === 100) strengths.push('Business Model Canvas Strategyzer complété à 100%.')
    else weaknesses.push(`Business Model Canvas incomplet (${bmcFilledCount}/9 blocs).`)

    if (bpComp >= 75) strengths.push('Business Plan structuré et détaillé.')
    else weaknesses.push('Business Plan incomplet nécessitant d’approfondir les opérations et la commercialisation.')

    if (finComp >= 70) strengths.push('Modélisation financière avec prévisions de trésorerie et point mort.')
    else weaknesses.push('Viabilité financière et structure de charges à formaliser.')

    if (pitchComp >= 75) strengths.push('Pitch prêt pour présentation orale devant jury ou partenaires.')

    // Recommended Actions
    if (problemDefinedComp < 70) {
      recommendedNextActions.push({
        title: 'Mener des entretiens utilisateurs',
        description: 'Consignez les besoins et frustrations de votre cible pour valider votre problème dans l’outil Design Thinking.',
        targetTool: 'Design Thinking',
        targetRoute: `/projects/${projectId}/design-thinking`,
        priority: 'HIGH',
      })
    }

    if (bmcComp < 100) {
      recommendedNextActions.push({
        title: 'Compléter le Business Model Canvas',
        description: 'Remplissez les 9 blocs Strategyzer pour aligner la proposition de valeur avec vos canaux et flux de revenus.',
        targetTool: 'Business Model Canvas',
        targetRoute: `/projects/${projectId}/bmc`,
        priority: 'HIGH',
      })
    }

    if (finComp < 60) {
      recommendedNextActions.push({
        title: 'Modéliser vos flux financiers',
        description: 'Renseignez vos coûts fixes et variables pour vérifier votre point mort (seuil de rentabilité).',
        targetTool: 'Modélisation Financière',
        targetRoute: `/projects/${projectId}/finances`,
        priority: 'MEDIUM',
      })
    }

    if (bpComp < 70 && (bmcComp >= 50 || problemDefinedComp >= 50)) {
      recommendedNextActions.push({
        title: 'Synchroniser le Business Plan',
        description: 'Utilisez la synchronisation automatique pour importer vos données de Design Thinking et BMC directement dans le Business Plan.',
        targetTool: 'Business Plan',
        targetRoute: `/projects/${projectId}/business-plan`,
        priority: 'MEDIUM',
      })
    }

    if (pitchComp < 70) {
      recommendedNextActions.push({
        title: 'Préparer votre Pitch Deck',
        description: 'Générez votre support de pitch 3 minutes à partir de tout votre travail accompli.',
        targetTool: 'Pitch Builder',
        targetRoute: `/projects/${projectId}/pitch`,
        priority: 'LOW',
      })
    }

    const dataCirculation = {
      designThinkingHasData: (activeDt?.understand?.problem?.length ?? 0) > 0 || (activeDt?.define?.personas?.length ?? 0) > 0,
      bmcHasData: bmcFilledCount > 0,
      businessPlanHasData: bpComp > 0,
      financesHasData: finComp > 0,
      pitchHasData: pitchComp > 0,
    }

    return {
      projectId,
      projectTitle: project.title,
      overallScore,
      currentStageId,
      stages,
      completedStagesCount,
      strengths,
      weaknesses,
      recommendedNextActions,
      dataCirculation,
    }
  }

  async sync(actorId: string, projectId: string, input: CrossToolSyncRequest): Promise<CrossToolSyncResponse> {
    await this.assertMember(actorId, projectId)

    const updatedSections: string[] = []

    if (input.targetTool === 'BUSINESS_PLAN' || input.targetTool === 'ALL') {
      await this.bpService.syncFromUpstream(actorId, projectId, input.overwriteCustomFields)
      updatedSections.push('Business Plan')
    }

    if (input.targetTool === 'PITCH' || input.targetTool === 'ALL') {
      await this.pitchService.generate(actorId, projectId, { format: 'three_minutes', overrideExisting: input.overwriteCustomFields })
      updatedSections.push('Pitch Builder')
    }

    if (input.targetTool === 'BMC' && input.sourceTool === 'DESIGN_THINKING') {
      // Sync DT -> BMC
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { canvas: true, designThinking: true },
      })
      if (project?.designThinking && Array.isArray(project.designThinking.iterations)) {
        const iterations = project.designThinking.iterations as unknown as DtIteration[]
        const activeIt = iterations[project.designThinking.activeIterationIndex] || iterations[0]
        if (activeIt) {
          const currentCanvas = project.canvas
          const candidateBlocks = currentCanvas?.blocks && typeof currentCanvas.blocks === 'object' ? (currentCanvas.blocks as unknown as BmcBlocks) : null
          const blocks: BmcBlocks = candidateBlocks ? { ...candidateBlocks } : Object.fromEntries(BMC_BLOCK_KEYS.map((k) => [k, { content: '', isPublic: false }])) as BmcBlocks

          if (input.overwriteCustomFields || !blocks.customerSegments.content) {
            blocks.customerSegments.content = activeIt.understand.targetUsers || activeIt.define.personas.map((p) => p.name).join(', ') || blocks.customerSegments.content
          }
          if (input.overwriteCustomFields || !blocks.valuePropositions.content) {
            blocks.valuePropositions.content = activeIt.prototype.solutionDescription || activeIt.define.problemStatement || blocks.valuePropositions.content
          }

          const completedBlocks = BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim().length > 0).length
          await this.prisma.businessModelCanvas.upsert({
            where: { projectId },
            create: {
              projectId,
              blocks: blocks as unknown as Prisma.InputJsonValue,
              completion: Math.round((completedBlocks / BMC_BLOCK_KEYS.length) * 100),
              updatedById: actorId,
            },
            update: {
              blocks: blocks as unknown as Prisma.InputJsonValue,
              completion: Math.round((completedBlocks / BMC_BLOCK_KEYS.length) * 100),
              updatedById: actorId,
            },
          })
          updatedSections.push('Business Model Canvas (Segments & Proposition de valeur)')
        }
      }
    }

    return {
      success: true,
      updatedSections,
      message: `Synchronisation réussie pour : ${updatedSections.join(', ') || 'aucun outil ciblé'}.`,
    }
  }

  private async assertMember(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, members: { where: { userId: actorId, leftAt: null }, select: { id: true, role: true } } },
    })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Accès au projet refusé.')
  }
}
