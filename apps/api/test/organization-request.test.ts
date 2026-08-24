import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ConflictException, BadRequestException } from '@nestjs/common'
import { OrganizationRequestController } from '../src/organization-request/organization-request.controller.js'
import { OrganizationRequestService } from '../src/organization-request/organization-request.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { AUDIT_ACTION_KEY } from '../src/audit/audit.decorator.js'

const input = {
  organizationType: 'INCUBATOR' as const,
  organizationName: ' Incubateur Anosy ',
  countryCode: 'mg',
  region: 'Analamanga',
  website: 'https://incubateur.example.mg',
  description: 'Un programme qui accompagne les équipes étudiantes malgaches.',
  sectorsOfInterest: ['Agriculture'],
  contactName: 'Miora Rakoto',
  contactRole: 'Chargée de programme',
  contactEmail: 'MIORA@EXAMPLE.MG',
  contactPhone: '+261340000000',
  supportingDocuments: [{ fileName: 'registre.pdf', contentType: 'application/pdf', sizeBytes: 42_000 }],
}

const createdRequest = {
  id: 'request-1',
  status: 'PENDING',
  createdAt: new Date('2026-08-22T10:00:00.000Z'),
}

test('B-01 crée une demande normalisée et retourne son numéro', async () => {
  let createArgs: { data: Record<string, unknown> } | undefined
  const prisma = {
    organizationRequest: {
      findFirst: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        createArgs = args
        return createdRequest
      },
    },
  } as unknown as PrismaService

  const result = await new OrganizationRequestService(prisma).create(input)

  assert.deepEqual(result, {
    requestId: 'request-1',
    status: 'PENDING',
    receivedAt: createdRequest.createdAt,
  })
  assert.deepEqual(createArgs?.data, {
    organizationType: 'INCUBATOR',
    organizationName: 'Incubateur Anosy',
    countryCode: 'MG',
    region: 'Analamanga',
    website: 'https://incubateur.example.mg',
    description: 'Un programme qui accompagne les équipes étudiantes malgaches.',
    sectorsOfInterest: ['Agriculture'],
    contactName: 'Miora Rakoto',
    contactRole: 'Chargée de programme',
    contactEmail: 'miora@example.mg',
    contactPhone: '+261340000000',
    supportingDocuments: [{ fileName: 'registre.pdf', contentType: 'application/pdf', sizeBytes: 42_000 }],
  })
})

test('B-01 refuse une demande identique encore active', async () => {
  const prisma = {
    organizationRequest: {
      findFirst: async () => ({ id: 'request-existing', status: 'PENDING' }),
    },
  } as unknown as PrismaService

  await assert.rejects(
    () => new OrganizationRequestService(prisma).create(input),
    (error: unknown) => error instanceof ConflictException && error.getResponse() instanceof Object,
  )
})

test('B-01 transforme un payload invalide en erreur de validation', async () => {
  const prisma = { organizationRequest: { findFirst: async () => null } } as unknown as PrismaService

  await assert.rejects(
    () => new OrganizationRequestService(prisma).create({ ...input, contactEmail: 'not-an-email' }),
    (error: unknown) => error instanceof BadRequestException,
  )
})

test('B-01 annote la route de création avec un audit organisationnel', () => {
  assert.deepEqual(
    Reflect.getMetadata(AUDIT_ACTION_KEY, OrganizationRequestController.prototype.create),
    { action: 'ORGANIZATION_REQUEST_CREATE', targetType: 'OrganizationRequest' },
  )
})


test('B-12 téléverse les fichiers avant de persister leurs références Cloudinary', async () => {
  let createArgs: { data: Record<string, unknown> } | undefined
  const prisma = {
    organizationRequest: {
      findFirst: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        createArgs = args
        return createdRequest
      },
    },
  } as unknown as PrismaService
  const cloudinary = {
    uploadDocuments: async () => [{
      fileName: 'registre.pdf',
      contentType: 'application/pdf',
      sizeBytes: 42_000,
      cloudinaryPublicId: 'cofound/request-1/registre',
      cloudinaryResourceType: 'raw' as const,
      cloudinaryDeliveryType: 'authenticated' as const,
      cloudinaryFormat: 'pdf',
      cloudinaryAssetId: 'asset-1',
      cloudinaryVersion: 1,
    }],
  }
  await new OrganizationRequestService(prisma, cloudinary as never).create(input, [{
    originalname: 'registre.pdf',
    mimetype: 'application/pdf',
    size: 42_000,
    buffer: Buffer.from('pdf'),
  }])
  assert.deepEqual(createArgs?.data.supportingDocuments, await cloudinary.uploadDocuments())
})
