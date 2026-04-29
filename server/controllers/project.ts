import type { H3Event } from 'h3'

import type { MultipartFile } from '~~/server/utils/s3'

import { Buffer } from 'node:buffer'
import ProjectModel from '~~/server/models/project'
import { deleteFromS3, uploadToS3 } from '~~/server/utils/s3'
import { generateUniqueSlug } from '~~/server/utils/slug'
import { getRouterParam } from '#imports'

export async function getProjects(event?: H3Event) {
  try {
    const query = event ? getQuery(event) : {}
    const pageSize = Number.parseInt(query.pageSize as string || '0') || 0
    const pageNum = Number.parseInt(query.pageNum as string || '1') || 1
    const skips = pageSize * (pageNum - 1)
    const filters = query.filter || {}

    const searchFilter: any = { status: 'published' }
    if (filters && typeof filters === 'object') {
      Object.assign(searchFilter, filters)
    }

    const projects = await ProjectModel.find(searchFilter)
      .sort({ updatedAt: -1 })
      .skip(skips)
      .limit(pageSize)
      .exec()

    const count = await ProjectModel.countDocuments(searchFilter)

    return {
      projects,
      count,
      pageCount: Math.ceil(count / pageSize),
    }
  }
  catch (error) {
    throw createError({ statusCode: 422, message: error instanceof Error ? error.message : 'Failed to fetch projects' })
  }
}

export async function getAdminProjects(event: H3Event) {
  try {
    const session = await requireUserSession(event)
    const sessionUser = session?.user as Record<string, any>

    if (!sessionUser) {
      throw createError({ statusCode: 401, message: 'User not authenticated' })
    }

    const projects = await ProjectModel.find({ author: sessionUser._id })
      .sort({ createdAt: -1 })
      .populate('category')
      .exec()

    return projects
  }
  catch (error) {
    throw createError({
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Failed to fetch admin projects',
    })
  }
}

export async function getProjectById(event: H3Event) {
  try {
    const projectId = getRouterParam(event, 'id')

    const foundProject = await ProjectModel.findById(projectId)
      .populate('category')
      .populate('author', '-_id -password -email -role')
      .exec()

    if (!foundProject) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }

    return foundProject
  }
  catch (error) {
    throw createError({
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Failed to fetch project by ID',
    })
  }
}

export async function getProjectBySlug(event: H3Event) {
  try {
    const slug = getRouterParam(event, 'slug')

    const foundProject = await ProjectModel.findOne({ slug })
      .populate('category')
      .populate('author', '-_id -password -email -role')
      .exec()

    if (!foundProject) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }

    return foundProject
  }
  catch (error) {
    throw createError({
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Failed to fetch project by slug',
    })
  }
}

// Needs recheck
export async function createProject(event: H3Event) {
  const projectData = await readBody(event)
  const { user } = (await requireUserSession(event))
  const project = new ProjectModel(projectData)
  project.author = (user as Record<string, any>)._id

  // Generate storage location with unique slug
  const uniqueSlug = await generateUniqueSlug(projectData.title, ProjectModel)
  project.storageLocation = `projects/${uniqueSlug}`

  return await project.save()
}

export async function updateProject(event: H3Event) {
  const projectId = getRouterParam(event, 'id')

  // Handle both JSON and FormData
  const contentType = getHeader(event, 'content-type') || ''
  let projectData: any

  if (contentType.includes('multipart/form-data')) {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, message: 'Invalid form data' })
    }

    // Extract text fields from FormData first
    const getField = (name: string) => {
      const field = formData.find(f => f.name === name)
      return field?.data.toString() || ''
    }

    // Collect image files for upload
    const imageFiles = formData.filter(item =>
      item.name === 'images' && item.data,
    )

    let uploadedImages: any[] = []

    // If there are new images to upload, use the upload API endpoint
    if (imageFiles.length > 0) {
      try {
        // Create a new FormData to send to the upload endpoint
        const uploadFormData = new FormData()
        imageFiles.forEach((file) => {
          // Convert Buffer to File/Blob for the upload endpoint
          const fileData = Buffer.from(file.data)
          const blob = new Blob([fileData], { type: file.type || 'application/octet-stream' })
          uploadFormData.append('files', blob, file.filename)
        })

        uploadFormData.append('storageLocation', getField('storageLocation'))

        // Get the base URL for internal API calls
        const baseUrl = process.env.NUXT_PUBLIC_SITE_URL
          || process.env.BASE_URL
          || 'http://localhost:3400'

        // Call the upload API endpoint using native fetch
        const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
          method: 'POST',
          body: uploadFormData,
          // Don't set Content-Type - let the browser/node set it with boundary
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          throw new Error(errorData.statusMessage || 'Upload failed')
        }

        const result = await uploadResponse.json()

        // Extract the uploaded file information
        if (result.success && result.files) {
          uploadedImages = result.files.map((file: any) => ({
            location: file.fileUrl,
            key: file.fileName,
            size: file.fileSize,
            mimeType: file.mimeType,
          }))
        }
      }
      catch (uploadError) {
        console.error('Failed to upload images:', uploadError)
        throw createError({
          statusCode: 500,
          message: uploadError instanceof Error ? uploadError.message : 'Failed to upload images to S3',
        })
      }
    }

    projectData = {
      authorID: getField('authorID'),
      categoryID: getField('categoryID'),
      createdAt: getField('createdAt'),
      description: getField('description'),
      promoVideoLink: getField('promoVideoLink'),
      productLink: getField('productLink'),
      requirements: getField('requirements'),
      status: getField('status'),
      subtitle: getField('subtitle'),
      title: getField('title'),
      storageLocation: getField('storageLocation'),
      storageLocationNew: getField('storageLocationNew'),
      updatedAt: getField('updatedAt'),
      wsl: getField('wsl'),
    }

    // Add uploaded images to project data
    if (uploadedImages.length > 0) {
      projectData.images = uploadedImages
    }
  }
  else {
    projectData = await readBody(event)
  }

  // Parse JSON strings safely
  try {
    projectData.requirements = typeof projectData.requirements === 'string'
      ? JSON.parse(projectData.requirements)
      : projectData.requirements
  }
  catch {
    projectData.requirements = []
  }

  try {
    projectData.wsl = typeof projectData.wsl === 'string'
      ? JSON.parse(projectData.wsl)
      : projectData.wsl
  }
  catch {
    projectData.wsl = []
  }

  projectData.updatedAt = Date.now()

  const project = await ProjectModel.findById(projectId).populate('category').exec()
  if (!project)
    throw createError({ statusCode: 404, message: 'Project not found' })

  if (projectData.status && projectData.status === 'published') {
    project.slug = await generateUniqueSlug(project.title, ProjectModel, projectId)
  }

  project.set(projectData)
  return await project.save()
}

export async function deleteProject(event: H3Event) {
  try {
    const projectId = getRouterParam(event, 'id')

    await ProjectModel.deleteOne({ _id: projectId })
    return { status: true, message: 'The Project has been deleted Successfully...' }
  }
  catch (error) {
    throw createError({ statusCode: 500, message: error instanceof Error ? error.message : 'Failed to delete project' })
  }
}

export async function deleteProjectImage(event: H3Event) {
  try {
    const imageId = getRouterParam(event, 'imageId')
    const projectId = getRouterParam(event, 'id')
    const { field, index, s3Key } = await readBody(event)

    console.log('Delete project image request:', { imageId, field, index, s3Key })

    const project = await ProjectModel.findById(projectId)
    if (!project) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }

    // Delete from S3 if s3Key is provided (for existing uploaded images)
    if (s3Key) {
      try {
        await deleteFromS3(s3Key)
        console.log(`Successfully deleted from S3: ${s3Key}`)
      }
      catch (s3Error) {
        console.error(`Failed to delete from S3: ${s3Key}`, s3Error)
        // Continue with database update even if S3 deletion fails
      }
    }

    // Remove from database
    if (field === 'images' && Array.isArray(project.images)) {
      console.log(`Before splice - images count: ${project.images.length}, removing index: ${index}`)
      project.images.splice(index, 1)
      // Mark the array as modified to ensure Mongoose saves the change
      project.markModified('images')
      console.log(`After splice - images count: ${project.images.length}`)
    }
    else if (field === 'image') {
      project.image = ''
    }

    await project.save()
    console.log('Project saved successfully after image deletion')
    return { status: true, message: 'Image deleted successfully' }
  }
  catch (error) {
    console.error('Error in deleteProjectImage:', error)
    throw createError({ statusCode: 500, message: error instanceof Error ? error.message : 'Failed to delete project image' })
  }
}
