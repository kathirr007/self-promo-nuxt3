import type { H3Event } from 'h3'

import ProjectModel from '~~/server/models/project'
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
  const projectData = await readBody(event)

  projectData.requirements = typeof projectData.requirements === 'string' ? JSON.parse(projectData.requirements) : projectData.requirements
  projectData.wsl = typeof projectData.wsl === 'string' ? JSON.parse(projectData.wsl) : projectData.wsl
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
    const imageId = getRouterParam(event, 'id')
    const { field, index } = await readBody(event)

    const project = await ProjectModel.findById(imageId)
    if (!project) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }

    if (field === 'images' && Array.isArray(project.images)) {
      project.images.splice(index, 1)
    }
    else if (field === 'image') {
      project.image = ''
    }

    await project.save()
    return { status: true, message: 'Image deleted successfully' }
  }
  catch (error) {
    throw createError({ statusCode: 500, message: error instanceof Error ? error.message : 'Failed to delete project image' })
  }
}
