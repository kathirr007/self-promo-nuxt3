import type { Product } from '../models/types/product'
import slugify from 'slugify'
import ExperienceModel from '~/server/models/experience'
import ProductModel from '~/server/models/product'
import ProjectModel from '~/server/models/project'
import CategoryModel from '../models/category'
import UserModel from '../models/user'
import { deleteImage, deleteImages } from './upload-photo'

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

/* export const getProducts = async function () {
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
}

export const getAdminProducts = function (req, res) {
  const userId = req.user.id

  ProjectModel.find({ author: userId })
    .populate('author')
    .sort({ updatedAt: -1 })
    .exec((errors, products) => {
      if (errors) {
        return res.status(422).send(errors)
      }

      return res.json(products)
    })
}

export function getProductById(req, res) {
  const id = req.params.id

  ProjectModel.findById(id)
    .populate('category')
    .exec((errors, product) => {
      if (errors) {
        return res.status(422).send(errors)
      }

      return res.json(product)
    })
}

export function getProductBySlug(req, res) {
  const slug = req.params.slug

  ProjectModel.findOne({ slug })
    .populate('author -_id -password -products -email -role')
    .exec((errors, product) => {
      if (errors) {
        return res.status(422).send(errors)
      }

      return res.json(product)
    })
}

// Needs recheck
export const createProduct = function (req, res) {
  const productData = req.body
  const user = req.user
  const product = new ProductModel(productData)
  product.author = user
  product.storageLocation = `projects/${slugify(productData.title, {
    replacement: '-', // replace spaces with replacement
    remove: null, // regex to remove characters
    lower: true, // result in lower case
  })}`

  product.save((errors, createdProduct) => {
    if (errors) {
      return res.status(422).send(errors)
    }

    return res.json(createdProduct)
  })
}

export const updateProduct = function (req, res) {
  // debugger
  const images = req.files
    ? req.files.map((file) => {
      return {
        location: file.location,
        size: file.size,
        originalname: file.originalname,
      }
    })
    : []
  // let updateQuery = {
  //   title: req.body.title,
  //   subtitle: req.body.subtitle,
  //   description: req.body.description,
  //   price: req.body.price,
  //   projectLink: req.body.projectLink,
  //   promoVideoLink: req.body.promoVideoLink,
  //   createdAt: req.body.createdAt,
  //   updatedAt: req.body.updatedAt,
  //   category: req.body.categoryID,
  //   category: req.body.categoryID,
  //   author: req.body.authorID,
  // }
  // if(req.files.length !=0) {
  //     updateQuery.image = req.files[0].location
  //     updateQuery.images = images
  // }
  const productId = req.params.id
  const productData = req.body
  if (req.files.length !== 0) {
    productData.image = req.files[0].location
    productData.images = images
  }
  else {
    productData.images = JSON.parse(productData.images)
  }
  productData.requirements = JSON.parse(productData.requirements)
  productData.wsl = JSON.parse(productData.wsl)
  productData.updatedAt = Date.now()

  ProjectModel.findById(productId)
    .populate('category')
    .exec((errors, product) => {
      if (errors) {
        return res.status(422).send(errors)
      }

      // if (productData.status && productData.status === 'published' && !product.slug) {
      if (productData.status && productData.status === 'published') {
        product.slug = slugify(product.title, {
          replacement: '-', // replace spaces with replacement
          remove: null, // regex to remove characters
          lower: true, // result in lower case
        })
      }

      product.set(productData)
      product.save((errors, savedProduct) => {
        if (errors) {
          return res.status(422).send(errors)
        }

        return res.json(savedProduct)
      })
    })
}

export const deleteProduct = async function (req, res) {
  const productId = req.params.id

  try {
    const deletedProduct = await ProjectModel.deleteOne(
      {
        _id: productId,
      },
      (err, deletedProduct) => {
        if (err) {
          return res.json({
            success: false,
            message: err.message,
          })
        }
        return res.json({
          status: true,
          message: 'The Product has been deleted Successfully...',
        })
      },
    )
  }
  catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

export const deleteProductImage = async function (req, res) {
  // const productImageId = req.params.id;
  // let key = this.uploadedFiles[index].location.split('/').pop()
  // debugger
  const params = {
    Bucket: 'kathirr007-portfolio',
    Key: `${req.headers.storagelocation}`,
  }

  try {
    const deletedProductImage = await deleteImage(params)
    return res.json({
      status: true,
      message: 'The Product Image has been deleted Successfully...',
    })
  }
  catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
} */
