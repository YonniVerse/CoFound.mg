import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { consentGrantSchema, consentPurposeSchema, consentRevokeSchema, ApiErrorCode, type ConsentPurpose } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ConsentService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    const consents = await this.prisma.consent.findMany({ where: { userId }, orderBy: [{ purpose: 'asc' }, { grantedAt: 'desc' }] })
    return { consents: consents.map((consent) => this.serialize(consent)) }
  }

  async grant(userId: string, rawPurpose: string, rawInput: unknown) {
    const purpose = this.parsePurpose(rawPurpose)
    const parsed = consentGrantSchema.safeParse(rawInput)
    if (!parsed.success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'consent.errors.invalidGrant', details: { issues: parsed.error.issues } })
    const input = parsed.data
    return this.prisma.$transaction(async (transaction) => {
      const active = await transaction.consent.findFirst({ where: { userId, purpose, revokedAt: null }, orderBy: { grantedAt: 'desc' } })
      if (active?.policyVersion === input.policyVersion) return this.serialize(active)
      if (active) await transaction.consent.update({ where: { id: active.id }, data: { revokedAt: new Date() } })
      const consent = await transaction.consent.create({ data: { userId, purpose, policyVersion: input.policyVersion } })
      return this.serialize(consent)
    })
  }

  async revoke(userId: string, rawPurpose: string, rawInput: unknown) {
    const purpose = this.parsePurpose(rawPurpose)
    const parsed = consentRevokeSchema.safeParse(rawInput)
    if (!parsed.success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'consent.errors.confirmationRequired' })
    const active = await this.prisma.consent.findFirst({ where: { userId, purpose, revokedAt: null }, orderBy: { grantedAt: 'desc' } })
    if (!active) throw new NotFoundException({ code: ApiErrorCode.NOT_FOUND, messageKey: 'consent.errors.notActive' })
    const consent = await this.prisma.consent.update({ where: { id: active.id }, data: { revokedAt: new Date() } })
    return this.serialize(consent)
  }

  private parsePurpose(rawPurpose: string): ConsentPurpose {
    const parsed = consentPurposeSchema.safeParse(rawPurpose)
    if (!parsed.success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'consent.errors.invalidPurpose' })
    return parsed.data
  }

  private serialize(consent: { id: string; purpose: string; policyVersion: string; grantedAt: Date; revokedAt: Date | null }) {
    return { id: consent.id, purpose: consent.purpose, policyVersion: consent.policyVersion, grantedAt: consent.grantedAt, revokedAt: consent.revokedAt, active: consent.revokedAt === null }
  }
}
