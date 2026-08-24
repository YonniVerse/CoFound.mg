export type PaymentIntent = {
  amount: string
  currency: string
  type: string
  projectId: string
  organizationId: string
}

export type PaymentProviderResult = {
  externalRef: string
  provider: 'OFF_PLATFORM' | 'MOBILE_MONEY'
}

export interface PaymentProvider {
  createIntent(input: PaymentIntent): Promise<PaymentProviderResult>
}
