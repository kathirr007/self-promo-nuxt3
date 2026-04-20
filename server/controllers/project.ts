import type { H3Event } from 'h3'
import type { Product } from '~~/server/models/types/product'
import slugify from 'slugify'
import { deleteImage } from '~~/server/controllers/upload-photo'
import CategoryModel from '~~/server/models/category'
import ProductModel from '~~/server/models/product'
import ProjectModel from '~~/server/models/project'
import UserModel from '~~/server/models/user'
import { getRouterParam } from '#imports'

export async function getProducts(): Promise<Product[]> {
  // let data: any
  return await ProductModel.find({ status: 'published' })
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

export async function getAdminProducts(event: H3Event) {
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

export async function getProductBySlug(event: H3Event) {
  const slug = getRouterParam(event, 'slug')

  return await ProjectModel.findOne({ slug })
    .populate('author', '-_id -password -products -email -role')
    .exec()
}

// Needs recheck
export async function createProduct(event: H3Event) {
  const productData = await readBody(event)
  const { user } = (await requireUserSession(event))
  const product = new ProductModel(productData)
  product.author = (user as Record<string, any>)._id
  product.storageLocation = `projects/${slugify(productData.title, {
    replacement: '-',
    lower: true,
  })}`

  return await product.save()
}

export async function updateProduct(event: H3Event) {
  const productId = getRouterParam(event, 'id')
  const productData = await readBody(event)

  productData.requirements = typeof productData.requirements === 'string' ? JSON.parse(productData.requirements) : productData.requirements
  productData.wsl = typeof productData.wsl === 'string' ? JSON.parse(productData.wsl) : productData.wsl
  productData.updatedAt = Date.now()

  const product = await ProjectModel.findById(productId).populate('category').exec()
  if (!product)
    throw createError({ statusCode: 404, message: 'Product not found' })

  if (productData.status && productData.status === 'published') {
    product.slug = slugify(product.title, {
      replacement: '-',
      lower: true,
    })
  }

  product.set(productData)
  return await product.save()
}

export async function deleteProduct(event: H3Event) {
  try {
    const productId = getRouterParam(event, 'id')

    await ProjectModel.deleteOne({ _id: productId })
    return { status: true, message: 'The Product has been deleted Successfully...' }
  }
  catch (error) {
    throw createError({ statusCode: 422, message: error instanceof Error ? error.message : 'Failed to delete experience' })
  }
}

export async function deleteProductImage(event: H3Event) {
  const storageLocation = getHeader(event, 'storagelocation')
  const params = {
    Bucket: 'kathirr007-portfolio',
    Key: `${storageLocation}`,
  }

  await deleteImage(params)
  return { status: true, message: 'The Product Image has been deleted Successfully...' }
}
