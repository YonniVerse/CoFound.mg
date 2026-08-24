import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import type { PaymentIntent, PaymentProvider, PaymentProviderResult } from './payment-provider.port.js'

@Injectable()
export class OffPlatformPaymentProvider implements PaymentProvider {
  async createIntent(input: PaymentIntent): Promise<PaymentProviderResult> {
    void input
    return { provider: 'OFF_PLATFORM', externalRef: `OFF-${randomUUID()}` }
  }
}
