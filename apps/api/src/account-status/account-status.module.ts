import { Module } from '@nestjs/common'
import { AccountStatusController } from './account-status.controller.js'
import { AccountStatusService } from './account-status.service.js'

@Module({ controllers: [AccountStatusController], providers: [AccountStatusService], exports: [AccountStatusService] })
export class AccountStatusModule {}
