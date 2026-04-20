import { DeleteObjectCommand, DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3'
import multer from 'multer'
import multerS3 from 'multer-s3'

// Configure AWS S3 Client with v3 SDK
const s3Client = new S3Client({
  region: useRuntimeConfig().awsRegion || 'us-east-1',
  credentials: {
    accessKeyId: useRuntimeConfig().awsAccessKeyId,
    secretAccessKey: useRuntimeConfig().awsSecretKey,
  },
})

// Convert deleteImage to use AWS SDK v3
async function deleteImage(params: { Bucket: string, Key: string }): Promise<void> {
  try {
    const command = new DeleteObjectCommand(params)
    await s3Client.send(command)
    console.log('Image deleted...')
  }
  catch (err) {
    console.log(err)
    throw err
  }
}

// Convert to use AWS SDK v3 DeleteObjectsCommand
async function deleteImages(event: any): Promise<void> {
  const headers = getHeaders(event)

  const objects = headers.uploadedfiles !== 'undefined'
    ? JSON.parse(headers.uploadedfiles as string).map((key: any) => ({
        Key: key.location.split('/').splice(3).join('/'),
      }))
    : []

  if (objects.length !== 0 && headers.deletefiles !== 'false') {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: 'kathirr007-portfolio',
        Delete: { Objects: objects, Quiet: true },
      })
      await s3Client.send(command)
      console.log('Images deleted...')
    }
    catch (err) {
      console.log(err)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete images',
      })
    }
  }
}

// Convert Nuxt 4 server middleware to use AWS SDK v3
export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)

  const objects = headers.uploadedfiles !== 'undefined'
    ? JSON.parse(headers.uploadedfiles as string).map((key: any) => ({
        Key: key.location.split('/').splice(3).join('/'),
      }))
    : []

  if (objects.length !== 0 && headers.deletefiles !== 'false') {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: 'kathirr007-portfolio',
        Delete: { Objects: objects, Quiet: true },
      })
      await s3Client.send(command)
      console.log('Images deleted...')
    }
    catch (err) {
      console.log(err)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete images',
      })
    }
  }
})

// Multer configuration for single upload using AWS SDK v3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'kathirr007-portfolio',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=31536000',
    metadata: (req: any, file: any, cb: any) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req: any, file: any, cb: any) => {
      if (req.headers.storagelocationnew !== 'null') {
        cb(null, `${req.headers.storagelocationnew}/${Date.now().toString()}`)
      }
      else {
        cb(null, `${req.headers.storagelocation}/${Date.now().toString()}`)
      }
    },
  }),
})

// Multer configuration for multiple uploads using AWS SDK v3
const multiUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'kathirr007-portfolio',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=31536000',
    metadata: (req: any, file: any, cb: any) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req: any, file: any, cb: any) => {
      cb(null, `projects/${Date.now().toString()}`)
    },
  }),
})

export { deleteImage, deleteImages, multiUpload, upload }
