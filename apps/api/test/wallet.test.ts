/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { WalletService } from '../src/wallet/wallet.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

function auditMock(): AuditService {
  return { record: async () => undefined } as unknown as AuditService
}

function walletFixture(overrides: Partial<{ balance: Prisma.Decimal; organizationId: string | null; projectId: string | null; ownerType: 'ORGANIZATION' | 'PROJECT' }> = {}) {
  return { id: 'w1', organizationId: null, projectId: null, ownerType: 'ORGANIZATION', currency: 'MGA', balance: new Prisma.Decimal(0), createdAt: new Date(), updatedAt: new Date(), transactions: [], ...overrides }
}

test('wallet organisation crédite et débite le solde sans compte utilisateur propriétaire', async () => {
  let wallet = walletFixture({ organizationId: 'org1' })
  const transactions: any[] = []
  const prisma = {
    organizationMember: { findUnique: async () => ({ role: 'ORG_ADMIN', user: { status: 'ACTIVE' } }) },
    wallet: {
      upsert: async () => wallet,
      update: async ({ data }: any) => { wallet = { ...wallet, balance: data.balance }; return wallet },
      findUnique: async () => ({ ...wallet, transactions }),
    },
    walletTransaction: { create: async ({ data }: any) => { transactions.unshift({ id: `t${transactions.length + 1}`, ...data, createdAt: new Date() }); return transactions[0] } },
    $transaction: async (callback: any) => callback({ wallet: { upsert: async () => wallet, update: async ({ data }: any) => { wallet = { ...wallet, balance: data.balance }; return wallet }, findUnique: async () => ({ ...wallet, transactions }), findUniqueOrThrow: async () => ({ ...wallet, transactions }) }, walletTransaction: { create: async ({ data }: any) => { transactions.unshift({ id: `t${transactions.length + 1}`, ...data, createdAt: new Date() }); return transactions[0] } } }),
  } as unknown as PrismaService
  const service = new WalletService(prisma, auditMock())
  await service.creditOrganization('u1', 'org1', { amount: 10000, currency: 'MGA', description: 'Crédit fictif de test' })
  const result = await service.debitOrganization('u1', 'org1', { amount: 2500, currency: 'MGA', description: 'Débit fictif de test' })
  assert.equal(result.balance, '7500')
  assert.equal(result.organizationId, 'org1')
  assert.equal(result.projectId, null)
  assert.equal(result.transactions.length, 2)
})

test('wallet projet refuse un débit supérieur au solde', async () => {
  let wallet = walletFixture({ ownerType: 'PROJECT', projectId: 'p1', balance: new Prisma.Decimal(100) })
  const prisma = {
    projectMember: { findUnique: async () => ({ role: 'OWNER', user: { status: 'ACTIVE' } }) },
    project: { findUnique: async () => ({ id: 'p1' }) },
    wallet: { upsert: async () => wallet },
    $transaction: async (callback: any) => callback({ wallet: { upsert: async () => wallet, update: async ({ data }: any) => { wallet = { ...wallet, balance: data.balance }; return wallet }, findUnique: async () => ({ ...wallet, transactions: [] }) }, walletTransaction: { create: async () => undefined } }),
  } as unknown as PrismaService
  await assert.rejects(() => new WalletService(prisma, auditMock()).debitProject('u1', 'p1', { amount: 101, currency: 'MGA', description: 'Débit impossible' }), (error: unknown) => error instanceof BadRequestException)
})

test('wallet projet exige le propriétaire du projet', async () => {
  const prisma = { projectMember: { findUnique: async () => ({ role: 'MEMBER', user: { status: 'ACTIVE' } }) } } as unknown as PrismaService
  await assert.rejects(() => new WalletService(prisma, auditMock()).getProjectWallet('u1', 'p1'), (error: unknown) => error instanceof ForbiddenException)
})
