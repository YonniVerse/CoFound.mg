import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PostType, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import type { ProjectPost, ProjectPostCreateInput, ProjectPostUpdateInput, ProjectPostsResponse } from '@cofound/shared'

const postInclude = {
  author: { select: { id: true, pseudonym: true } },
} satisfies Prisma.PostInclude

type PostWithAuthor = Prisma.PostGetPayload<{ include: typeof postInclude }>

@Injectable()
export class ProjectPostsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async requireMember(projectId: string, userId: string) {
    const membership = await this.prisma.projectMember.findFirst({ where: { projectId, userId, leftAt: null } })
    if (!membership) throw new ForbiddenException({ code: 'PROJECT_ACCESS_DENIED', messageKey: 'errors.projectAccessDenied' })
    return membership
  }

  private async resolveAuthorId(transaction: Prisma.TransactionClient, userId: string) {
    const profile = await transaction.talentProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!profile) throw new BadRequestException({ code: 'PROFILE_REQUIRED', messageKey: 'errors.profileRequired' })
    return profile.id
  }

  private toPost(post: PostWithAuthor): ProjectPost {
    return {
      id: post.id,
      projectId: post.projectId,
      authorId: post.authorId,
      authorPseudonym: post.author.pseudonym,
      type: post.type,
      content: post.content,
      sectorId: post.sectorId,
      expiresAt: post.expiresAt,
      createdAt: post.createdAt,
    }
  }

  async list(projectId: string, requesterId: string): Promise<ProjectPostsResponse> {
    await this.requireMember(projectId, requesterId)
    const posts = await this.prisma.post.findMany({ where: { projectId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: postInclude, orderBy: { createdAt: 'desc' } })
    return { projectId, posts: posts.map((post) => this.toPost(post)) }
  }

  async create(projectId: string, requesterId: string, input: ProjectPostCreateInput) {
    await this.requireMember(projectId, requesterId)
    const post = await this.prisma.$transaction(async (transaction) => {
      const authorId = await this.resolveAuthorId(transaction, requesterId)
      return transaction.post.create({ data: { projectId, authorId, type: input.type as PostType, content: input.content, sectorId: input.sectorId ?? null, expiresAt: input.expiresAt ?? null }, include: postInclude })
    })
    return this.toPost(post)
  }

  async update(projectId: string, postId: string, requesterId: string, input: ProjectPostUpdateInput) {
    await this.requireMember(projectId, requesterId)
    const post = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.post.findFirst({ where: { id: postId, projectId }, include: { author: { select: { userId: true } } } })
      if (!existing) throw new NotFoundException({ code: 'POST_NOT_FOUND', messageKey: 'errors.postNotFound' })
      if (existing.author.userId !== requesterId) throw new ForbiddenException({ code: 'POST_OWNER_REQUIRED', messageKey: 'errors.postOwnerRequired' })
      return transaction.post.update({ where: { id: postId }, data: { type: input.type as PostType | undefined, content: input.content, sectorId: input.sectorId === undefined ? undefined : input.sectorId, expiresAt: input.expiresAt === undefined ? undefined : input.expiresAt }, include: postInclude })
    })
    return this.toPost(post)
  }

  async remove(projectId: string, postId: string, requesterId: string) {
    await this.requireMember(projectId, requesterId)
    await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.post.findFirst({ where: { id: postId, projectId }, include: { author: { select: { userId: true } } } })
      if (!existing) throw new NotFoundException({ code: 'POST_NOT_FOUND', messageKey: 'errors.postNotFound' })
      if (existing.author.userId !== requesterId) throw new ForbiddenException({ code: 'POST_OWNER_REQUIRED', messageKey: 'errors.postOwnerRequired' })
      await transaction.post.delete({ where: { id: postId } })
    })
    return { deleted: true, id: postId }
  }
}
