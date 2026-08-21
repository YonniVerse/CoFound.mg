import { Body, Controller, Headers, Post } from '@nestjs/common'
import { emailBounceWebhookSchema } from '@cofound/shared'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { BounceService } from './bounce.service.js'

@Controller('webhooks/email')
@AllowAnonymous()
export class BounceController {
  constructor(private readonly bounceService: BounceService) {}

  @Post('bounce')
  async bounce(@Body() body: unknown, @Headers('x-webhook-signature') signature?: string) {
    const payload = emailBounceWebhookSchema.parse(body)
    this.bounceService.verifySignature(JSON.stringify(body), signature)
    return this.bounceService.markBounced(payload)
  }
}
