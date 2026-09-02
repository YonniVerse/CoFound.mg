import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  type DtPatchInput,
  type DtResponse,
  type DtIteration,
  type DtUnderstand,
  type DtDefine,
  type DtIdeate,
  type DtPrototype,
  type DtTest,
} from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class DesignThinkingService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async get(actorId: string, projectId: string): Promise<DtResponse> {
    await this.assertMember(actorId, projectId)
    const record = await this.prisma.projectDesignThinking.findUnique({ where: { projectId } })
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { title: true, pitch: true } })

    if (!record) {
      const defaultIteration = this.createDefaultIteration(1, 'Itération 1 - Exploration initiale', project?.pitch)
      return {
        projectId,
        iterations: [defaultIteration],
        activeIterationIndex: 0,
        completion: defaultIteration.completion,
        updatedAt: null,
        updatedById: null,
      }
    }

    return this.toResponse(projectId, record)
  }

  async patch(actorId: string, projectId: string, input: DtPatchInput): Promise<DtResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({ where: { id: projectId }, select: { title: true, pitch: true } })
      const current = await transaction.projectDesignThinking.findUnique({ where: { projectId } })

      let iterations: DtIteration[]
      if (!current || !Array.isArray(current.iterations) || current.iterations.length === 0) {
        iterations = [this.createDefaultIteration(1, 'Itération 1 - Exploration initiale', project?.pitch)]
      } else {
        iterations = (current.iterations as unknown as DtIteration[]).map((it, idx) => this.normalizeIteration(it, idx + 1))
      }

      const targetIndex = Math.min(Math.max(0, input.iterationIndex), iterations.length - 1)
      let iteration = iterations[targetIndex]
      if (!iteration) {
        iteration = this.createDefaultIteration(1, 'Itération 1 - Exploration initiale', project?.pitch)
        iterations = [iteration]
      }

      if (input.phase === 'iteration_meta') {
        if (typeof input.data.title === 'string' && input.data.title.trim()) {
          iteration.title = input.data.title.trim()
        }
      } else if (input.phase === 'understand') {
        iteration.understand = { ...iteration.understand, ...(input.data as unknown as Partial<DtUnderstand>) }
      } else if (input.phase === 'define') {
        iteration.define = { ...iteration.define, ...(input.data as unknown as Partial<DtDefine>) }
      } else if (input.phase === 'ideate') {
        iteration.ideate = { ...iteration.ideate, ...(input.data as unknown as Partial<DtIdeate>) }
      } else if (input.phase === 'prototype') {
        iteration.prototype = { ...iteration.prototype, ...(input.data as unknown as Partial<DtPrototype>) }
      } else if (input.phase === 'test') {
        iteration.test = { ...iteration.test, ...(input.data as unknown as Partial<DtTest>) }
      }

      iteration.updatedAt = new Date()
      iteration.phaseCompletion = this.calculatePhaseCompletions(iteration)
      iteration.completion = Math.round(
        (iteration.phaseCompletion.understand +
          iteration.phaseCompletion.define +
          iteration.phaseCompletion.ideate +
          iteration.phaseCompletion.prototype +
          iteration.phaseCompletion.test) /
          5
      )

      const activeIterationIndex = current ? Math.min(current.activeIterationIndex, iterations.length - 1) : 0
      const overallCompletion = iterations[activeIterationIndex]?.completion ?? iteration.completion

      const saved = await transaction.projectDesignThinking.upsert({
        where: { projectId },
        create: {
          projectId,
          iterations: iterations as unknown as Prisma.InputJsonValue,
          activeIterationIndex,
          completion: overallCompletion,
          updatedById: actorId,
        },
        update: {
          iterations: iterations as unknown as Prisma.InputJsonValue,
          activeIterationIndex,
          completion: overallCompletion,
          updatedById: actorId,
        },
      })

      return this.toResponse(projectId, saved)
    })
  }

  async addIteration(actorId: string, projectId: string, title?: string): Promise<DtResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({ where: { id: projectId }, select: { title: true, pitch: true } })
      const current = await transaction.projectDesignThinking.findUnique({ where: { projectId } })

      let iterations: DtIteration[]
      if (!current || !Array.isArray(current.iterations) || current.iterations.length === 0) {
        iterations = [this.createDefaultIteration(1, 'Itération 1 - Exploration initiale', project?.pitch)]
      } else {
        iterations = (current.iterations as unknown as DtIteration[]).map((it, idx) => this.normalizeIteration(it, idx + 1))
      }

      const nextNumber = iterations.length + 1
      const newTitle = title?.trim() || `Itération ${nextNumber}`
      const prevIteration = iterations[iterations.length - 1]

      const newIteration = this.createDefaultIteration(nextNumber, newTitle, project?.pitch)
      if (prevIteration) {
        newIteration.understand.problem = prevIteration.understand.problem
        newIteration.understand.targetUsers = prevIteration.understand.targetUsers
      }
      newIteration.phaseCompletion = this.calculatePhaseCompletions(newIteration)

      iterations.push(newIteration)
      const activeIterationIndex = iterations.length - 1

      const saved = await transaction.projectDesignThinking.upsert({
        where: { projectId },
        create: {
          projectId,
          iterations: iterations as unknown as Prisma.InputJsonValue,
          activeIterationIndex,
          completion: newIteration.completion,
          updatedById: actorId,
        },
        update: {
          iterations: iterations as unknown as Prisma.InputJsonValue,
          activeIterationIndex,
          completion: newIteration.completion,
          updatedById: actorId,
        },
      })

      return this.toResponse(projectId, saved)
    })
  }

  async setActiveIteration(actorId: string, projectId: string, index: number): Promise<DtResponse> {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.projectDesignThinking.findUnique({ where: { projectId } })
      if (!current) throw new NotFoundException('Design Thinking non initialisé.')

      const iterations = (current.iterations as unknown as DtIteration[]).map((it, idx) => this.normalizeIteration(it, idx + 1))
      const safeIndex = Math.min(Math.max(0, index), iterations.length - 1)
      const overallCompletion = iterations[safeIndex]?.completion ?? 0

      const saved = await transaction.projectDesignThinking.update({
        where: { projectId },
        data: {
          activeIterationIndex: safeIndex,
          completion: overallCompletion,
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

  private createDefaultIteration(iterationNumber: number, title: string, initialPitch?: string): DtIteration {
    const understand: DtUnderstand = {
      problem: initialPitch ? `Défi initial : ${initialPitch}` : '',
      targetUsers: '',
      context: '',
      fieldObservations: '',
      interviews: [],
      userNeeds: [],
      userFrustrations: [],
      userMotivations: [],
    }
    const define: DtDefine = {
      personas: [],
      mainNeeds: [],
      keyInsights: [],
      problemStatement: '',
      howMightWe: [],
    }
    const ideate: DtIdeate = {
      brainstormIdeas: [],
      selectedIdeaId: null,
      selectionRationale: '',
    }
    const prototype: DtPrototype = {
      solutionDescription: '',
      prototypeType: 'wireframe',
      testedHypotheses: [],
      prototypeElements: '',
      userJourneySteps: [],
    }
    const test: DtTest = {
      testedUsersSummary: '',
      testedHypothesesResults: [],
      observedResults: '',
      userFeedback: '',
      keyLearnings: [],
      decision: 'ITERATE',
      nextActionPlan: '',
    }

    const iteration: DtIteration = {
      id: `it_${iterationNumber}_${Date.now()}`,
      iterationNumber,
      title,
      understand,
      define,
      ideate,
      prototype,
      test,
      phaseCompletion: { understand: 0, define: 0, ideate: 0, prototype: 0, test: 0 },
      completion: 0,
      updatedAt: new Date(),
    }

    iteration.phaseCompletion = this.calculatePhaseCompletions(iteration)
    iteration.completion = Math.round(
      (iteration.phaseCompletion.understand +
        iteration.phaseCompletion.define +
        iteration.phaseCompletion.ideate +
        iteration.phaseCompletion.prototype +
        iteration.phaseCompletion.test) /
        5
    )

    return iteration
  }

  private normalizeIteration(raw: unknown, defaultNum: number): DtIteration {
    const candidate = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const id = typeof candidate.id === 'string' ? candidate.id : `it_${defaultNum}`
    const iterationNumber = typeof candidate.iterationNumber === 'number' ? candidate.iterationNumber : defaultNum
    const title = typeof candidate.title === 'string' ? candidate.title : `Itération ${iterationNumber}`

    const rawUnderstand = candidate.understand && typeof candidate.understand === 'object' ? (candidate.understand as Record<string, unknown>) : {}
    const understand: DtUnderstand = {
      problem: typeof rawUnderstand.problem === 'string' ? rawUnderstand.problem : '',
      targetUsers: typeof rawUnderstand.targetUsers === 'string' ? rawUnderstand.targetUsers : '',
      context: typeof rawUnderstand.context === 'string' ? rawUnderstand.context : '',
      fieldObservations: typeof rawUnderstand.fieldObservations === 'string' ? rawUnderstand.fieldObservations : '',
      interviews: Array.isArray(rawUnderstand.interviews) ? (rawUnderstand.interviews as DtUnderstand['interviews']) : [],
      userNeeds: Array.isArray(rawUnderstand.userNeeds) ? (rawUnderstand.userNeeds as string[]) : [],
      userFrustrations: Array.isArray(rawUnderstand.userFrustrations) ? (rawUnderstand.userFrustrations as string[]) : [],
      userMotivations: Array.isArray(rawUnderstand.userMotivations) ? (rawUnderstand.userMotivations as string[]) : [],
    }

    const rawDefine = candidate.define && typeof candidate.define === 'object' ? (candidate.define as Record<string, unknown>) : {}
    const define: DtDefine = {
      personas: Array.isArray(rawDefine.personas) ? (rawDefine.personas as DtDefine['personas']) : [],
      mainNeeds: Array.isArray(rawDefine.mainNeeds) ? (rawDefine.mainNeeds as string[]) : [],
      keyInsights: Array.isArray(rawDefine.keyInsights) ? (rawDefine.keyInsights as string[]) : [],
      problemStatement: typeof rawDefine.problemStatement === 'string' ? rawDefine.problemStatement : '',
      howMightWe: Array.isArray(rawDefine.howMightWe) ? (rawDefine.howMightWe as string[]) : [],
    }

    const rawIdeate = candidate.ideate && typeof candidate.ideate === 'object' ? (candidate.ideate as Record<string, unknown>) : {}
    const ideate: DtIdeate = {
      brainstormIdeas: Array.isArray(rawIdeate.brainstormIdeas) ? (rawIdeate.brainstormIdeas as DtIdeate['brainstormIdeas']) : [],
      selectedIdeaId: typeof rawIdeate.selectedIdeaId === 'string' ? rawIdeate.selectedIdeaId : null,
      selectionRationale: typeof rawIdeate.selectionRationale === 'string' ? rawIdeate.selectionRationale : '',
    }

    const rawPrototype = candidate.prototype && typeof candidate.prototype === 'object' ? (candidate.prototype as Record<string, unknown>) : {}
    const prototype: DtPrototype = {
      solutionDescription: typeof rawPrototype.solutionDescription === 'string' ? rawPrototype.solutionDescription : '',
      prototypeType: (['wireframe', 'storyboard', 'paper_mockup', 'landing_page', 'service_blueprint', 'functional_mvp', 'other'].includes(rawPrototype.prototypeType as string) ? rawPrototype.prototypeType : 'wireframe') as DtPrototype['prototypeType'],
      customPrototypeType: typeof rawPrototype.customPrototypeType === 'string' ? rawPrototype.customPrototypeType : undefined,
      testedHypotheses: Array.isArray(rawPrototype.testedHypotheses) ? (rawPrototype.testedHypotheses as string[]) : [],
      prototypeElements: typeof rawPrototype.prototypeElements === 'string' ? rawPrototype.prototypeElements : '',
      userJourneySteps: Array.isArray(rawPrototype.userJourneySteps) ? (rawPrototype.userJourneySteps as string[]) : [],
    }

    const rawTest = candidate.test && typeof candidate.test === 'object' ? (candidate.test as Record<string, unknown>) : {}
    const test: DtTest = {
      testedUsersSummary: typeof rawTest.testedUsersSummary === 'string' ? rawTest.testedUsersSummary : '',
      testedHypothesesResults: Array.isArray(rawTest.testedHypothesesResults) ? (rawTest.testedHypothesesResults as DtTest['testedHypothesesResults']) : [],
      observedResults: typeof rawTest.observedResults === 'string' ? rawTest.observedResults : '',
      userFeedback: typeof rawTest.userFeedback === 'string' ? rawTest.userFeedback : '',
      keyLearnings: Array.isArray(rawTest.keyLearnings) ? (rawTest.keyLearnings as string[]) : [],
      decision: (['PERSEVERE', 'ITERATE', 'PIVOT', 'ABANDON'].includes(rawTest.decision as string) ? rawTest.decision : 'ITERATE') as DtTest['decision'],
      nextActionPlan: typeof rawTest.nextActionPlan === 'string' ? rawTest.nextActionPlan : '',
    }

    const iteration: DtIteration = {
      id,
      iterationNumber,
      title,
      understand,
      define,
      ideate,
      prototype,
      test,
      phaseCompletion: { understand: 0, define: 0, ideate: 0, prototype: 0, test: 0 },
      completion: 0,
      updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt as string | number | Date) : new Date(),
    }

    iteration.phaseCompletion = this.calculatePhaseCompletions(iteration)
    iteration.completion = Math.round(
      (iteration.phaseCompletion.understand +
        iteration.phaseCompletion.define +
        iteration.phaseCompletion.ideate +
        iteration.phaseCompletion.prototype +
        iteration.phaseCompletion.test) /
        5
    )

    return iteration
  }

  private calculatePhaseCompletions(iteration: DtIteration) {
    // 1. Understand
    let understandPoints = 0
    if (iteration.understand.problem.trim().length > 10) understandPoints += 25
    if (iteration.understand.targetUsers.trim().length > 5) understandPoints += 25
    if (iteration.understand.interviews.length > 0 || iteration.understand.fieldObservations.trim().length > 10) understandPoints += 25
    if (iteration.understand.userNeeds.length > 0 || iteration.understand.userFrustrations.length > 0) understandPoints += 25

    // 2. Define
    let definePoints = 0
    if (iteration.define.personas.length > 0) definePoints += 30
    if (iteration.define.problemStatement.trim().length > 10) definePoints += 35
    if (iteration.define.howMightWe.length > 0 || iteration.define.keyInsights.length > 0) definePoints += 35

    // 3. Ideate
    let ideatePoints = 0
    if (iteration.ideate.brainstormIdeas.length >= 2) ideatePoints += 40
    else if (iteration.ideate.brainstormIdeas.length === 1) ideatePoints += 20
    if (iteration.ideate.selectedIdeaId) ideatePoints += 30
    if (iteration.ideate.selectionRationale.trim().length > 10) ideatePoints += 30

    // 4. Prototype
    let prototypePoints = 0
    if (iteration.prototype.solutionDescription.trim().length > 10) prototypePoints += 35
    if (iteration.prototype.testedHypotheses.length > 0) prototypePoints += 35
    if (iteration.prototype.prototypeElements.trim().length > 10 || iteration.prototype.userJourneySteps.length > 0) prototypePoints += 30

    // 5. Test
    let testPoints = 0
    if (iteration.test.testedUsersSummary.trim().length > 5 || iteration.test.testedHypothesesResults.length > 0) testPoints += 30
    if (iteration.test.observedResults.trim().length > 10 || iteration.test.userFeedback.trim().length > 10) testPoints += 30
    if (iteration.test.keyLearnings.length > 0) testPoints += 20
    if (iteration.test.nextActionPlan.trim().length > 10) testPoints += 20

    return {
      understand: Math.min(100, understandPoints),
      define: Math.min(100, definePoints),
      ideate: Math.min(100, ideatePoints),
      prototype: Math.min(100, prototypePoints),
      test: Math.min(100, testPoints),
    }
  }

  private toResponse(
    projectId: string,
    record: { iterations: Prisma.JsonValue; activeIterationIndex: number; completion: number; updatedAt: Date | null; updatedById: string | null }
  ): DtResponse {
    const rawList = Array.isArray(record.iterations) ? record.iterations : []
    const iterations = rawList.map((it, idx) => this.normalizeIteration(it, idx + 1))
    const safeActiveIndex = Math.min(Math.max(0, record.activeIterationIndex), Math.max(0, iterations.length - 1))
    const currentIt = iterations[safeActiveIndex]
    const completion = currentIt ? currentIt.completion : record.completion

    return {
      projectId,
      iterations,
      activeIterationIndex: safeActiveIndex,
      completion,
      updatedAt: record.updatedAt,
      updatedById: record.updatedById,
    }
  }
}
