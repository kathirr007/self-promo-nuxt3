import type { H3Event } from 'h3'

import type { Project } from '~~/server/models/types/project'
import slugify from 'slugify'
import { deleteImage } from '~~/server/controllers/upload-photo'
import CategoryModel from '~~/server/models/category'
import ProductModel from '~~/server/models/product'
import ProjectModel from '~~/server/models/project'
import UserModel from '~~/server/models/user'
import { getRouterParam } from '#imports'

export async function getProjects(): Promise<Project[]> {
  // let data: any
  return await ProjectModel.find({ status: 'published' })
    .populate('category', '_id name', CategoryModel)
    .populate('author', '_id -_id -password -products -email -role', UserModel)
    .sort({ updatedAt: -1 })
    .exec()
    // .then((products) => {
    //   console.log('projects: ', products)
    //   data = products
    // })
    // .catch((err) => {
    //   throw new Error(err)
    // })
  // return data
  /* await ProductModel.find({})
    // .populate('author -_id -password -products -email -role')
    // .populate('category')
    // .populate('cuid', 'uid avatar name', CategoryModel)
    .populate('_id', 'password products email role', UserModel)
    .populate('_id', 'category', CategoryModel)
    .sort({ updatedAt: -1 })
    .exec()
    .then((products) => {
      data = products
    })
    .catch((err) => {
      throw new Error(err)
    })
  return data */
}

/* export async function getProducts() {
  ProjectModel.find({ status: 'published' })
    .populate('author -_id -password -products -email -role')
    .populate('category')
    .sort({ updatedAt: -1 })
    .exec((errors, products) => {
      if (errors) {
        return res.status(422).send(errors)
      }

      return res.json(products)
    })
} */

export async function getAdminProjects(event: H3Event): Promise<Project[]> {
  const userId = ((await requireUserSession(event)).user as Record<string, any>)._id

  return await ProjectModel.find({ author: userId })
    .populate('author')
    .sort({ updatedAt: -1 })
    .exec()
}

export async function getProductById(event: H3Event) {
  const id = getRouterParam(event, 'id')

  return await ProjectModel.findById(id)
    .populate('category')
    .exec()
}

export async function getProjectBySlug(event: H3Event) {
  const slug = getRouterParam(event, 'slug')

  return await ProjectModel.findOne({ slug })
    .populate('author', '-_id -password -products -email -role')
    .exec()
}

// Needs recheck
export async function createProject(event: H3Event) {
  const projectData = await readBody(event)
  const { user } = (await requireUserSession(event))
  const project = new ProjectModel(projectData)
  project.author = (user as Record<string, any>)._id
  project.storageLocation = `projects/${slugify(projectData.title, {
    replacement: '-',
    lower: true,
  })}`

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
    project.slug = slugify(project.title, {
      replacement: '-',
      lower: true,
    })
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
    throw createError({ statusCode: 422, message: error instanceof Error ? error.message : 'Failed to delete experience' })
  }
}

export async function deleteProjectImage(event: H3Event) {
  const storageLocation = getHeader(event, 'storagelocation')
  const params = {
    Bucket: 'kathirr007-portfolio',
    Key: `${storageLocation}`,
  }

  await deleteImage(params)
  return { status: true, message: 'The Product Image has been deleted Successfully...' }
}
