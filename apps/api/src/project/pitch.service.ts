import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  type BmcBlocks,
  type BpSections,
  type DtIteration,
  type PitchDeck,
  type PitchFormat,
  type PitchGenerateInput,
  type PitchPatchInput,
  type PitchResponse,
  type PitchSlide,
  type PitchSlideKey,
  PITCH_FORMATS,
  PITCH_SLIDE_KEYS,
} from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

const FORMAT_TARGET_SECONDS: Record<PitchFormat, number> = {
  elevator: 60,
  three_minutes: 180,
  five_minutes: 300,
  investor: 600,
}

const FORMAT_INCLUDED_SLIDES: Record<PitchFormat, PitchSlideKey[]> = {
  elevator: ['hook', 'problem', 'solution', 'valueProposition', 'financialsAsk', 'visionCallToAction'],
  three_minutes: ['hook', 'problem', 'targetUser', 'solution', 'valueProposition', 'productDemo', 'businessModel', 'tractionValidation', 'competitionAdvantage', 'team', 'financialsAsk', 'visionCallToAction'],
  five_minutes: PITCH_SLIDE_KEYS as unknown as PitchSlideKey[],
  investor: PITCH_SLIDE_KEYS as unknown as PitchSlideKey[],
}

@Injectable()
export class PitchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async get(actorId: string, projectId: string): Promise<PitchResponse> {
    await this.assertMember(actorId, projectId)
    const record = await this.prisma.projectPitch.findUnique({ where: { projectId } })

    if (!record) {
      return this.generateDefaultPitch(actorId, projectId, 'three_minutes')
    }

    return this.toResponse(projectId, record)
  }

  async patch(actorId: string, projectId: string, input: PitchPatchInput): Promise<PitchResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.projectPitch.findUnique({ where: { projectId } })

      let selectedFormat: PitchFormat = (current?.selectedFormat && PITCH_FORMATS.includes(current.selectedFormat as PitchFormat))
        ? (current.selectedFormat as PitchFormat)
        : 'three_minutes'

      if (input.selectedFormat && PITCH_FORMATS.includes(input.selectedFormat)) {
        selectedFormat = input.selectedFormat
      }

      let slides: PitchDeck
      if (!current || !current.slides || typeof current.slides !== 'object') {
        const generated = await this.buildGeneratedSlides(projectId, selectedFormat)
        slides = generated
      } else {
        slides = this.normalizeSlides(current.slides, selectedFormat)
      }

      if (input.slideKey && input.slideData && slides[input.slideKey]) {
        slides[input.slideKey] = {
          ...slides[input.slideKey],
          ...input.slideData,
        }
      }

      // Update inclusion status based on current format
      const includedKeys = FORMAT_INCLUDED_SLIDES[selectedFormat]
      for (const key of PITCH_SLIDE_KEYS) {
        if (slides[key]) {
          slides[key].isIncludedInFormat = includedKeys.includes(key)
        }
      }

      const totalEstimatedSeconds = this.calculateTotalDuration(slides, selectedFormat)
      const completion = this.calculateCompletion(slides, selectedFormat)

      const saved = await transaction.projectPitch.upsert({
        where: { projectId },
        create: {
          projectId,
          selectedFormat,
          slides: slides as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
        update: {
          selectedFormat,
          slides: slides as unknown as Prisma.InputJsonValue,
          completion,
          updatedById: actorId,
        },
      })

      return {
        projectId,
        selectedFormat,
        slides,
        totalEstimatedSeconds,
        formatTargetSeconds: FORMAT_TARGET_SECONDS[selectedFormat],
        completion,
        updatedAt: saved.updatedAt,
        updatedById: saved.updatedById,
      }
    })
  }

  async generate(actorId: string, projectId: string, input: PitchGenerateInput): Promise<PitchResponse> {
    await this.assertMember(actorId, projectId)
    return this.generateDefaultPitch(actorId, projectId, input.format || 'three_minutes')
  }

  private async generateDefaultPitch(actorId: string, projectId: string, format: PitchFormat): Promise<PitchResponse> {
    const slides = await this.buildGeneratedSlides(projectId, format)
    const totalEstimatedSeconds = this.calculateTotalDuration(slides, format)
    const completion = this.calculateCompletion(slides, format)

    const saved = await this.prisma.projectPitch.upsert({
      where: { projectId },
      create: {
        projectId,
        selectedFormat: format,
        slides: slides as unknown as Prisma.InputJsonValue,
        completion,
        updatedById: actorId,
      },
      update: {
        selectedFormat: format,
        slides: slides as unknown as Prisma.InputJsonValue,
        completion,
        updatedById: actorId,
      },
    })

    return {
      projectId,
      selectedFormat: format,
      slides,
      totalEstimatedSeconds,
      formatTargetSeconds: FORMAT_TARGET_SECONDS[format],
      completion,
      updatedAt: saved.updatedAt,
      updatedById: saved.updatedById,
    }
  }

  private async buildGeneratedSlides(projectId: string, format: PitchFormat): Promise<PitchDeck> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        canvas: true,
        designThinking: true,
        businessPlan: true,
        finance: true,
        members: { where: { leftAt: null }, include: { user: { include: { talentProfile: true, talentIdentity: true } } } },
      },
    })

    const title = project?.title || 'Notre Projet'
    const pitch = project?.pitch || ''
    const includedKeys = FORMAT_INCLUDED_SLIDES[format]

    // Extract Upstream Data
    let dtUnderstandProblem = ''
    let dtTargetUsers = ''
    let dtSolution = ''
    let dtPersonas = ''
    let dtTestLearnings = ''

    if (project?.designThinking && Array.isArray(project.designThinking.iterations)) {
      const iterations = project.designThinking.iterations as unknown as DtIteration[]
      const activeIt = iterations[project.designThinking.activeIterationIndex] || iterations[0]
      if (activeIt) {
        dtUnderstandProblem = activeIt.understand.problem
        dtTargetUsers = activeIt.understand.targetUsers
        dtSolution = activeIt.prototype.solutionDescription || activeIt.define.problemStatement
        dtPersonas = activeIt.define.personas.map((p) => `${p.name} (${p.roleOrOccupation})`).join(', ')
        dtTestLearnings = activeIt.test.keyLearnings.join(' ; ') || activeIt.test.observedResults
      }
    }

    const bmcBlocks = (project?.canvas?.blocks && typeof project.canvas.blocks === 'object') ? (project.canvas.blocks as unknown as BmcBlocks) : null
    const bpSections = (project?.businessPlan?.sections && typeof project.businessPlan.sections === 'object') ? (project.businessPlan.sections as unknown as BpSections) : null

    const fin = project?.finance
    const fundingRequired = bpSections?.financialPlan?.fundingRequired || (Array.isArray(fin?.initialInvestments) ? (fin.initialInvestments as Array<{ amount?: number }>).reduce((s, i) => s + (i.amount || 0), 0) : 0)
    const currency = fin?.currency || bpSections?.financialPlan?.fundingCurrency || 'MGA'

    const foundersList = (project?.members || []).map((m) => {
      const name = [m.user.talentIdentity?.firstName, m.user.talentIdentity?.lastName].filter(Boolean).join(' ') || m.user.talentProfile?.pseudonym || m.user.email
      return `${name} - ${m.role === 'OWNER' ? 'Fondateur' : m.functionalRole || 'Co-fondateur'}`
    })

    const slides: Partial<PitchDeck> = {
      hook: {
        key: 'hook',
        title: `Accroche & Énoncé du Défi`,
        speechScript: `Saviez-vous que ${dtUnderstandProblem || pitch || 'des milliers de personnes font face à ce défi au quotidien'} ? Aujourd'hui, nous vous présentons ${title}.`,
        visualBulletPoints: [
          `Projet : ${title}`,
          `Défi constaté : ${pitch || 'Opportunité majeure à Madagascar'}`,
        ],
        speakerNotes: 'Captez l’attention dès les 10 premières secondes avec un chiffre fort ou une anecdote vécue.',
        estimatedDurationSeconds: 15,
        isIncludedInFormat: includedKeys.includes('hook'),
      },
      problem: {
        key: 'problem',
        title: 'Le Problème & La Frustration',
        speechScript: `Le problème principal est le suivant : ${dtUnderstandProblem || pitch || 'La situation actuelle entraîne d\'importantes pertes de temps et d\'argent.'}`,
        visualBulletPoints: [
          `Problème : ${dtUnderstandProblem || pitch || 'Manque d’alternatives efficaces'}`,
          `Conséquences : Coûts élevés, inefficacité et opportunités perdues.`,
        ],
        speakerNotes: 'Montrez l’urgence et la douleur réelle ressentie par la cible.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('problem'),
      },
      targetUser: {
        key: 'targetUser',
        title: 'La Cible & Les Bénéficiaires',
        speechScript: `Notre cible prioritaire : ${dtTargetUsers || bmcBlocks?.customerSegments?.content || 'Les utilisateurs et clients locaux les plus impactés'}.`,
        visualBulletPoints: [
          `Segment principal : ${dtTargetUsers || bmcBlocks?.customerSegments?.content || 'Non renseigné'}`,
          `Personas : ${dtPersonas || 'Early Adopters identifiés sur le terrain'}`,
        ],
        speakerNotes: 'Prouvez que vous connaissez intimement vos utilisateurs.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('targetUser'),
      },
      solution: {
        key: 'solution',
        title: 'Notre Solution',
        speechScript: `Pour résoudre cela, nous avons conçu ${title} : ${dtSolution || bpSections?.productService?.description || 'une solution simple, accessible et adaptée au contexte'}.`,
        visualBulletPoints: [
          `Solution : ${title}`,
          `Approche : ${dtSolution || 'Centrée sur l’utilisateur et accessible'}`,
        ],
        speakerNotes: 'Expliquez la solution de façon limpide, sans jargon technique.',
        estimatedDurationSeconds: 25,
        isIncludedInFormat: includedKeys.includes('solution'),
      },
      valueProposition: {
        key: 'valueProposition',
        title: 'Proposition de Valeur Unique',
        speechScript: `Ce qui nous rend uniques : ${bmcBlocks?.valuePropositions?.content || bpSections?.productService?.valueProposition || 'Une proposition de valeur claire, rapide et économique'}.`,
        visualBulletPoints: [
          `Bénéfice clé : ${bmcBlocks?.valuePropositions?.content || 'Gain direct de temps et d’argent'}`,
          `Différenciation : Conçu spécifiquement pour le contexte local.`,
        ],
        speakerNotes: 'Insistez sur le bénéfice concret mesurable pour le client.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('valueProposition'),
      },
      productDemo: {
        key: 'productDemo',
        title: 'Produit & Démonstration',
        speechScript: `Voici comment fonctionne notre prototype / MVP : les utilisateurs effectuent leurs opérations en 3 étapes simples.`,
        visualBulletPoints: [
          `Étape 1 : Inscription / Prise de contact simplifiée`,
          `Étape 2 : Accès au service et traitement direct`,
          `Étape 3 : Résultat et suivi garanti`,
        ],
        speakerNotes: 'Si possible, montrez une capture d’écran ou une démonstration en direct de 20 secondes.',
        estimatedDurationSeconds: 25,
        isIncludedInFormat: includedKeys.includes('productDemo'),
      },
      businessModel: {
        key: 'businessModel',
        title: 'Modèle Économique',
        speechScript: `Comment nous générons des revenus : ${bmcBlocks?.revenueStreams?.content || bpSections?.businessModel?.revenueStreamsDescription || 'Ventes directes, commissions et abonnements prévisibles'}.`,
        visualBulletPoints: [
          `Sources de revenus : ${bmcBlocks?.revenueStreams?.content || 'Modèle transactionnel / Récurrent'}`,
          `Structure de coûts maîtrisée : ${bmcBlocks?.costStructure?.content || 'Coûts fixes limités'}`,
        ],
        speakerNotes: 'Rassurez sur la faisabilité économique et la rentabilité.',
        estimatedDurationSeconds: 25,
        isIncludedInFormat: includedKeys.includes('businessModel'),
      },
      tractionValidation: {
        key: 'tractionValidation',
        title: 'Traction & Validation Terrain',
        speechScript: `Nous avons validé nos hypothèses sur le terrain : ${dtTestLearnings || 'Retours très positifs lors des premiers tests utilisateurs'}.`,
        visualBulletPoints: [
          `Validation terrain : ${dtTestLearnings || 'Tests et entretiens qualitatifs menés'}`,
          `Intérêt confirmé par les premiers utilisateurs.`,
        ],
        speakerNotes: 'Les preuves de terrain (interviews, pré-commandes, lettres d’intérêt) ont un impact maximal.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('tractionValidation'),
      },
      marketOpportunity: {
        key: 'marketOpportunity',
        title: 'Opportunité de Marché',
        speechScript: `L’opportunité de marché : ${bpSections?.marketStudy?.targetMarket || 'Un marché en forte croissance à Madagascar et dans la région'}.`,
        visualBulletPoints: [
          `Taille de marché adressable : ${bpSections?.marketStudy?.targetMarket || 'Segment en expansion'}`,
          `Dynamique : Adoption croissante des solutions numériques et de proximité.`,
        ],
        speakerNotes: 'Présentez des chiffres réalistes plutôt que des estimations démesurées.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('marketOpportunity'),
      },
      competitionAdvantage: {
        key: 'competitionAdvantage',
        title: 'Concurrence & Avantage Distinctif',
        speechScript: `Face aux alternatives actuelles, notre avantage compétitif réside dans notre ancrage local, notre accessibilité et nos partenariats stratégiques.`,
        visualBulletPoints: [
          `Alternatives : ${bpSections?.marketStudy?.existingAlternatives || 'Méthodes informelles / Solutions importées inadaptées'}`,
          `Avantage : ${bpSections?.marketStudy?.competitiveAdvantage || 'Proximité, coût optimisé, simplicité'}`,
        ],
        speakerNotes: 'Ne dites jamais « nous n’avons pas de concurrents » ; montrez pourquoi vous êtes meilleurs.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('competitionAdvantage'),
      },
      goToMarket: {
        key: 'goToMarket',
        title: 'Stratégie Go-To-Market',
        speechScript: `Notre plan de déploiement : ${bmcBlocks?.channels?.content || 'Canaux de distribution de proximité, partenariats institutionnels et bouche-à-oreille'}.`,
        visualBulletPoints: [
          `Canaux d’acquisition : ${bmcBlocks?.channels?.content || 'Vente directe & relais locaux'}`,
          `Objectif initial : Conquérir notre premier bastion avant d’étendre à l’échelle nationale.`,
        ],
        speakerNotes: 'Montrez la première étape concrète pour obtenir vos 50 premiers clients.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('goToMarket'),
      },
      team: {
        key: 'team',
        title: 'L’Équipe',
        speechScript: `Pour mener ce projet, notre équipe réunit des compétences complémentaires : ${foundersList.join(', ') || 'Compétences techniques, gestion et terrain'}.`,
        visualBulletPoints: foundersList.length > 0 ? foundersList : ['Équipe pluridisciplinaire et engagée', 'Compétences techniques et commerciales'],
        speakerNotes: 'Mettez en valeur la complémentarité des profils et votre passion commune.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('team'),
      },
      financialsAsk: {
        key: 'financialsAsk',
        title: 'Finances & Besoins',
        speechScript: fundingRequired > 0
          ? `Nous recherchons un financement / accompagnement de ${fundingRequired.toLocaleString('fr-FR')} ${currency} pour franchir notre prochaine étape de déploiement.`
          : `Nous recherchons des partenaires et mentors pour nous accompagner dans notre phase d’amorçage.`,
        visualBulletPoints: [
          fundingRequired > 0 ? `Besoin financier : ${fundingRequired.toLocaleString('fr-FR')} ${currency}` : 'Recherche de partenaires stratégiques et mentors',
          `Utilisation : Développement produit, matériel, lancement et acquisition initiale.`,
        ],
        speakerNotes: 'Soyez précis sur ce que vous demandez et ce que vous allez accomplir avec ces ressources.',
        estimatedDurationSeconds: 20,
        isIncludedInFormat: includedKeys.includes('financialsAsk'),
      },
      visionCallToAction: {
        key: 'visionCallToAction',
        title: 'Vision & Appel à l’Action',
        speechScript: `Rejoignez-nous pour bâtir l’avenir de ${title}. Merci de votre attention, nous sommes à votre disposition pour vos questions !`,
        visualBulletPoints: [
          `Vision : Transformer durablement notre secteur à Madagascar.`,
          `Contact : Équipe ${title} sur CoFound.mg`,
        ],
        speakerNotes: 'Terminez avec énergie et souriez !',
        estimatedDurationSeconds: 15,
        isIncludedInFormat: includedKeys.includes('visionCallToAction'),
      },
    }

    return slides as PitchDeck
  }

  private normalizeSlides(raw: unknown, format: PitchFormat): PitchDeck {
    const candidate = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const includedKeys = FORMAT_INCLUDED_SLIDES[format]

    const result: Record<string, PitchSlide> = {}
    for (const key of PITCH_SLIDE_KEYS) {
      const s = candidate[key] && typeof candidate[key] === 'object' ? (candidate[key] as Record<string, unknown>) : {}
      result[key] = {
        key,
        title: typeof s.title === 'string' && s.title.trim() ? s.title : `Slide ${key}`,
        speechScript: typeof s.speechScript === 'string' ? s.speechScript : '',
        visualBulletPoints: Array.isArray(s.visualBulletPoints) ? (s.visualBulletPoints as string[]) : [],
        speakerNotes: typeof s.speakerNotes === 'string' ? s.speakerNotes : '',
        estimatedDurationSeconds: typeof s.estimatedDurationSeconds === 'number' ? s.estimatedDurationSeconds : 20,
        isIncludedInFormat: includedKeys.includes(key),
        missingElementsAlert: typeof s.missingElementsAlert === 'string' ? s.missingElementsAlert : undefined,
      }
    }

    return result as PitchDeck
  }

  private calculateTotalDuration(slides: PitchDeck, format: PitchFormat): number {
    const includedKeys = FORMAT_INCLUDED_SLIDES[format]
    let total = 0
    for (const key of includedKeys) {
      if (slides[key]) {
        total += slides[key].estimatedDurationSeconds || 0
      }
    }
    return total
  }

  private calculateCompletion(slides: PitchDeck, format: PitchFormat): number {
    const includedKeys = FORMAT_INCLUDED_SLIDES[format]
    if (includedKeys.length === 0) return 0

    let completedCount = 0
    for (const key of includedKeys) {
      const s = slides[key]
      if (s && s.speechScript.trim().length > 10) {
        completedCount++
      }
    }

    return Math.round((completedCount / includedKeys.length) * 100)
  }

  private async assertMember(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, members: { where: { userId: actorId, leftAt: null }, select: { id: true, role: true } } },
    })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Accès au projet refusé.')
  }

  private toResponse(
    projectId: string,
    record: { selectedFormat: string; slides: Prisma.JsonValue; completion: number; updatedAt: Date | null; updatedById: string | null }
  ): PitchResponse {
    const selectedFormat: PitchFormat = (PITCH_FORMATS.includes(record.selectedFormat as PitchFormat))
      ? (record.selectedFormat as PitchFormat)
      : 'three_minutes'

    const slides = this.normalizeSlides(record.slides, selectedFormat)
    const totalEstimatedSeconds = this.calculateTotalDuration(slides, selectedFormat)
    const completion = this.calculateCompletion(slides, selectedFormat)

    return {
      projectId,
      selectedFormat,
      slides,
      totalEstimatedSeconds,
      formatTargetSeconds: FORMAT_TARGET_SECONDS[selectedFormat],
      completion,
      updatedAt: record.updatedAt,
      updatedById: record.updatedById,
    }
  }
}
