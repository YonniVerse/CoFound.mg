import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { EmailBounceWebhook } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { readEmailConfig } from '../notifications/email-config.js'

@Injectable()
export class BounceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  verifySignature(rawBody: string, signature: string | undefined): void {
    const secret = readEmailConfig().webhookSecret
    if (!secret || !signature) throw new UnauthorizedException('Signature de webhook manquante.')
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    const provided = signature.replace(/^sha256=/, '')
    const expectedBuffer = Buffer.from(expected, 'utf8')
    const providedBuffer = Buffer.from(provided, 'utf8')
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new UnauthorizedException('Signature de webhook invalide.')
    }
  }

  async markBounced(event: EmailBounceWebhook): Promise<{ updatedRows: number }> {
    const result = await this.prisma.importRow.updateMany({
      where: {
        normalizedEmail: event.email.toLowerCase(),
        result: { not: 'BOUNCED' },
        ...(event.batchId ? { batchId: event.batchId } : {}),
      },
      data: { result: 'BOUNCED', errorCode: event.providerMessageId ? `BOUNCED:${event.providerMessageId}` : 'BOUNCED' },
    })
    return { updatedRows: result.count }
  }
}
