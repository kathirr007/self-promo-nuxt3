import type { Buffer } from 'node:buffer'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Log configuration for debugging (remove in production)
console.log('S3 Configuration:', {
  region: process.env.AWSRegion || 'us-east-2',
  hasAccessKey: !!process.env.AWSAccessKeyId,
  hasSecretKey: !!process.env.AWSSecretKey,
  bucket: 'kathirr007-portfolio',
})

const s3Client = new S3Client({
  region: process.env.AWSRegion || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWSAccessKeyId || '',
    secretAccessKey: process.env.AWSSecretKey || '',
  },
  // Force path style for some S3-compatible services
  forcePathStyle: false,
})

const BUCKET_NAME = 'kathirr007-portfolio'

/**
 * Detect MIME type from buffer magic bytes
 * @param buffer - File buffer to analyze
 * @returns Detected MIME type or fallback
 */
function detectMimeType(buffer: Buffer): string {
  // Check magic bytes for common image formats
  if (buffer.length >= 4) {
    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg'
    }
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png'
    }
    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return 'image/gif'
    }
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer.length >= 12) {
      if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'image/webp'
      }
    }
  }

  // Default to jpeg if cannot detect
  return 'image/jpeg'
}

/**
 * Get file extension from MIME type
 * @param mimeType - MIME type string
 * @returns File extension
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  }
  return mimeToExt[mimeType] || 'jpg'
}

export async function uploadToS3_2(fileBuffer: Buffer, folderPath?: string) {
  try {
    // Detect MIME type from buffer
    const mimeType = detectMimeType(fileBuffer)

    // Get file extension and create unique filename
    const extension = getExtensionFromMimeType(mimeType)
    const timestamp = Date.now().toString()
    const uniqueFilename = `${timestamp}.${extension}`

    // Build the S3 key with optional folder path
    const key = folderPath ? `${folderPath}/${uniqueFilename}` : uniqueFilename

    console.log('Uploading to S3:', {
      bucket: BUCKET_NAME,
      key,
      mimeType,
      size: fileBuffer.length,
    })

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: mimeType,
    })

    await s3Client.send(command)

    return {
      location: `https://${BUCKET_NAME}.s3.${process.env.AWSRegion || 'us-east-2'}.amazonaws.com/${key}`,
      key,
      size: fileBuffer.length,
      mimeType,
    }
  }
  catch (error: any) {
    console.error('S3 Upload Error:', {
      message: error.message,
      code: error.Code || error.code,
      region: process.env.AWSRegion || 'us-east-2',
      bucket: BUCKET_NAME,
      stack: error.stack,
    })
    throw error
  }
}

export async function deleteFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}
