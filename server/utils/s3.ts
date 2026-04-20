import type { Buffer } from 'node:buffer'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWSRegion || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWSAccessKeyId || '',
    secretAccessKey: process.env.AWSSecretKey || '',
  },
})

const BUCKET_NAME = 'kathirr007-portfolio'

export async function uploadToS3(fileBuffer: Buffer, filename: string, mimeType: string) {
  const key = `${Date.now().toString()}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  })

  await s3Client.send(command)

  return {
    location: `https://${BUCKET_NAME}.s3.${process.env.AWSRegion}.amazonaws.com/${key}`,
    key,
    size: fileBuffer.length,
    originalname: filename,
  }
}

export async function deleteFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}
