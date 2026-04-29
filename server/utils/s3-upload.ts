import type { FileValidation, S3UploadResult } from '~~/types/upload'
import { Buffer } from 'node:buffer'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Define MultipartFile interface since it's not exported from h3
export interface MultipartFile {
  name: string
  filename?: string
  type?: string
  size: number
  arrayBuffer: () => Promise<ArrayBuffer>
}

// File validation configuration
export const fileValidation: FileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
}

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWSAccessKeyId || '',
    secretAccessKey: process.env.AWSSecretKey || '',
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'kathirr007-portfolio'

// Generate unique file key
export function generateFileKey(originalName: string): string {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  const extension = originalName.split('.').pop() || ''
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '_')
  return `${uniqueSuffix}-${baseName}.${extension}`
}

// Validate file
export function validateFile(file: MultipartFile): { valid: boolean, error?: string } {
  // Check file size
  if (file.size > fileValidation.maxSize) {
    return {
      valid: false,
      error: `File "${file.filename}" is too large. Maximum size is ${Math.round(fileValidation.maxSize / (1024 * 1024))}MB.`,
    }
  }

  // Check file extension
  const extension = file.filename?.split('.').pop()?.toLowerCase()
  if (!extension || !fileValidation.allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File "${file.filename}" has an unsupported format. Allowed: ${fileValidation.allowedTypes.join(', ')}`,
    }
  }

  // Check MIME type
  if (file.type && !fileValidation.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File "${file.filename}" has an unsupported MIME type.`,
    }
  }

  return { valid: true }
}

// Upload file to S3
export async function uploadToS3(file: MultipartFile, folderPath?: string): Promise<S3UploadResult> {
  let key = generateFileKey(file.filename || 'unknown')
  if (folderPath) {
    key = `${folderPath}/${key}`
  }

  // Convert file data to Buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: file.type || 'application/octet-stream',
    ACL: 'public-read', // or 'private' depending on your needs
    Metadata: {
      originalName: file.filename || 'unknown',
      uploadedAt: new Date().toISOString(),
    },
  })

  try {
    const response = await s3Client.send(command)

    return {
      bucket: BUCKET_NAME,
      key,
      location: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`,
      etag: response.ETag || '',
      size: fileBuffer.length,
    }
  }
  catch (error) {
    console.error('S3 upload error:', error)
    throw new Error(`Failed to upload ${file.filename} to S3`)
  }
}
