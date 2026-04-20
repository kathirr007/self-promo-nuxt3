/* const ProductHero = require('../models/product-hero');

exports.createHero = function (req, res, next) {
  const productData = req.body;

  const productHero = new ProjectHeroModel(productData);
  productHero.product = productData.product;

  productHero.save((errors, createdHero) => {
    if (errors) {
      return res.status(422).send(errors);
    }

    return res.json(createdHero);
  });
};

exports.getProductHeroes = function (req, res, next) {

  ProductHero.find({})
    .populate('product')
    .sort({ createdAt: -1 })
    .exec(function (errors, heroes) {
      if (errors) {
        return res.status(422).send(errors);
      }
      // debugger
      return res.json(heroes);
    })
}

exports.updateProductHeroes = function (req, res, next) {
  const id = req.params.id;

  ProductHero.findById(id)
    .populate('product')
    .exec(function (errors, hero) {
      if (errors) {
        return res.status(422).send(errors);
      }

      hero.set({ createdAt: new Date() })
      hero.save((errors, updatedHero) => {
        if (errors) {
          return res.status(422).send(errors);
        }

        return res.json(updatedHero);
      })
    })
}

exports.deleteProductHero = async function (req, res, next) {
  const heroId = req.params.id;

  try {
    let deletedProduct = await ProductHero.deleteOne({
      _id: heroId
    }, (err, deletedHero) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        })
      }
      return res.json({
        status: true,
        message: 'The Hero has been deleted Successfully...'
      })
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
} */

import type { H3Event } from 'h3'
import type { ProjectHero } from '~~/server/models/types/project-hero'
// import { HTTPError } from 'h3'
import ProjectHeroModel from '~~/server/models/project-hero'

export async function createHero(event: H3Event) {
  try {
    const productData = await readBody<ProjectHero>(event)

    const productHero = new ProjectHeroModel(productData)

    const createdHero = await productHero.save()
    return createdHero
  }
  catch (errors) {
    throw createError({ statusCode: 422, message: errors instanceof Error ? errors.message : 'An error occurred while creating the hero' })
  }
}

export async function getProductHeroes(event: H3Event) {
  try {
    const heroes = await ProjectHeroModel.find({})
      .populate('product')
      .sort({ createdAt: -1 })
      .exec()

    return heroes
  }
  catch (errors) {
    throw createError({ statusCode: 422, message: errors instanceof Error ? errors.message : 'An error occurred while getting product heroes' })
  }
}

export async function updateProductHero(event: H3Event) {
  try {
    const id = getRouterParam(event, 'id')

    const hero = await ProjectHeroModel.findById(id)
      .populate('product')
      .exec()

    if (!hero) {
      throw createError({ statusCode: 404, message: 'Hero not found' })
    }

    hero.set({ createdAt: new Date() })
    const updatedHero = await hero.save()

    return updatedHero
  }
  catch (errors) {
    throw createError({ statusCode: 422, message: errors instanceof Error ? errors.message : 'An error occurred while updating the hero' })
  }
}

export async function deleteProjectHero(event: H3Event) {
  try {
    const heroId = getRouterParam(event, 'id')

    const deletedHero = await ProjectHeroModel.deleteOne({
      _id: heroId,
    })

    if (deletedHero.deletedCount === 0) {
      throw createError({ statusCode: 404, message: 'Hero not found' })
    }

    return {
      status: true,
      message: 'The Hero has been deleted Successfully...',
    }
  }
  catch (err: any) {
    throw createError({ statusCode: 500, message: err.message })
  }
}
