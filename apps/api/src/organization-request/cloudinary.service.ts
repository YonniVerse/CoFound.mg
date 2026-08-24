import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'
import { Readable } from 'node:stream'
import { randomUUID } from 'node:crypto'

export type CloudinaryDocument = {
  fileName: string
  contentType: string
  sizeBytes: number
  cloudinaryPublicId: string
  cloudinaryResourceType: 'image' | 'raw'
  cloudinaryDeliveryType: 'authenticated'
  cloudinaryFormat: string
  cloudinaryAssetId: string
  cloudinaryVersion: number
}

export type UploadedFile = {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset?: string
  folder?: string
}

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
])

const MAX_DOCUMENT_SIZE = 10_000_000

@Injectable()
export class CloudinaryService {
  private readonly config: CloudinaryConfig | null

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
    this.config = cloudName && apiKey && apiSecret
      ? {
          cloudName,
          apiKey,
          apiSecret,
          uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || undefined,
          folder: process.env.CLOUDINARY_FOLDER?.trim() || undefined,
        }
      : null

    if (this.config) {
      cloudinary.config({
        cloud_name: this.config.cloudName,
        api_key: this.config.apiKey,
        api_secret: this.config.apiSecret,
        secure: true,
      })
    }
  }

  isConfigured() {
    return this.config !== null
  }

  async uploadDocuments(files: UploadedFile[]): Promise<CloudinaryDocument[]> {
    if (files.length === 0) return []
    const config = this.requireConfig()
    const uploaded: CloudinaryDocument[] = []

    try {
      for (const file of files) {
        this.validateFile(file)
        uploaded.push(await this.uploadOne(file, config))
      }
      return uploaded
    } catch (error) {
      await Promise.allSettled(uploaded.map((document) => this.destroy(document)))
      throw error
    }
  }

  async destroy(document: Pick<CloudinaryDocument, 'cloudinaryPublicId' | 'cloudinaryResourceType'>) {
    if (!this.config) return
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(
        document.cloudinaryPublicId,
        {
          resource_type: document.cloudinaryResourceType,
          type: 'authenticated',
          invalidate: true,
        },
        (error) => error ? reject(error) : resolve(),
      )
    })
  }

  createTemporaryDownloadUrl(document: Pick<CloudinaryDocument, 'cloudinaryPublicId' | 'cloudinaryResourceType' | 'cloudinaryDeliveryType' | 'cloudinaryFormat'>, expiresInSeconds = 300) {
    this.requireConfig()
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds
    const url = cloudinary.utils.private_download_url(
      document.cloudinaryPublicId,
      document.cloudinaryFormat,
      {
        resource_type: document.cloudinaryResourceType,
        type: document.cloudinaryDeliveryType,
        expires_at: expiresAt,
        attachment: true,
      },
    )
    return { url, expiresAt: new Date(expiresAt * 1000).toISOString() }
  }

  private requireConfig() {
    if (!this.config) {
      throw new ServiceUnavailableException({
        code: 'FILE_STORAGE_NOT_CONFIGURED',
        messageKey: 'organizationRequest.errors.documentStorageUnavailable',
      })
    }
    return this.config
  }

  private validateFile(file: UploadedFile) {
    const extension = file.originalname.split('.').pop()?.toLowerCase()
    const allowedExtension = extension && new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']).has(extension)
    if (!DOCUMENT_MIME_TYPES.has(file.mimetype) || !allowedExtension || file.size <= 0 || file.size > MAX_DOCUMENT_SIZE) {
      throw new BadRequestException({
        code: 'DOCUMENT_NOT_ALLOWED',
        messageKey: 'organizationRequest.errors.documents',
      })
    }
  }

  private async uploadOne(file: UploadedFile, config: CloudinaryConfig): Promise<CloudinaryDocument> {
    const isImage = file.mimetype.startsWith('image/')
    const resourceType: 'image' | 'raw' = isImage ? 'image' : 'raw'
    const extension = file.originalname.split('.').pop()?.toLowerCase() ?? 'bin'
    const publicId = `${randomUUID()}${resourceType === 'raw' ? `.${extension}` : ''}`
    const options: UploadApiOptions = {
      resource_type: resourceType,
      type: 'authenticated',
      public_id: publicId,
      ...(config.folder ? { asset_folder: config.folder } : {}),
      ...(config.uploadPreset ? { upload_preset: config.uploadPreset } : {}),
      use_filename: false,
      unique_filename: false,
      context: { original_filename: file.originalname },
    }
    const response = await this.uploadBuffer(file.buffer, options)
    return {
      fileName: file.originalname,
      contentType: file.mimetype,
      sizeBytes: file.size,
      cloudinaryPublicId: response.public_id,
      cloudinaryResourceType: resourceType,
      cloudinaryDeliveryType: 'authenticated',
      cloudinaryFormat: response.format || extension,
      cloudinaryAssetId: response.asset_id,
      cloudinaryVersion: response.version,
    }
  }

  private uploadBuffer(buffer: Buffer, options: UploadApiOptions) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error)
          else if (result) resolve(result)
          else reject(new Error('Cloudinary returned no upload result'))
        },
      )
      Readable.from(buffer).pipe(stream)
    })
  }
}
