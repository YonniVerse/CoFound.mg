import { randomUUID } from 'node:crypto'
import type { PaymentIntent, PaymentProvider, PaymentProviderResult } from './payment-provider.port.js'

export class OffPlatformPaymentProvider implements PaymentProvider {
  async createIntent(input: PaymentIntent): Promise<PaymentProviderResult> {
    void input
    return { provider: 'OFF_PLATFORM', externalRef: `OFF-${randomUUID()}` }
  }
}
