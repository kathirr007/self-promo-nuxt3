/* const express = require("express");
const router = express.Router();

const AuthCtrl = require("../controllers/auth");
const ProductCtrl = require("../controllers/product");
const { deleteImages, upload } = require("../controllers/upload-photo");

router.get("", getProducts);

router.get(
  "/user-products",
  onlyAuthUser,
  onlyAdmin,
  getadminProducts
);
router.get("/:id", getProductById);
router.get("/s/:slug", getProductBySlug);

router.post(
  "",
  onlyAuthUser,
  onlyAdmin,
  createProduct
);
router.patch(
  "/:id",
  onlyAuthUser,
  onlyAdmin,
  // upload.none(),
  upload.array("images", 20),
  deleteImages(),
  updateProduct
);
router.delete(
  "/:id",
  onlyAuthUser,
  onlyAdmin,
  deleteImages(),
  deleteProduct
);
router.delete(
  "/ProdImage/:id",
  onlyAuthUser,
  onlyAdmin,
  deleteProductImage
);

module.exports = router; */

// Nuxt 4 API routes use file-based routing with HTTP method handlers
// This replaces the Express router pattern

import { onlyAdmin, onlyAuthUser } from '~~/server/controllers/auth'
import { createProduct, deleteProduct, deleteProductImage, getAdminProducts, getProductById, getProductBySlug, getProducts, updateProduct } from '~~/server/controllers/project'
import { deleteImages, upload } from '~~/server/controllers/upload-photo'

// GET /api/products
export default defineEventHandler(async (event) => {
  const method = event.method
  const url = getRouterParam(event, 'slug') || getRouterParam(event, 'id')

  switch (method) {
    case 'GET':
      if (url === 'user-products') {
        // GET /api/products/user-products
        const isAuthUser = await onlyAuthUser(event)
        const isAdmin = await onlyAdmin(event)
        if (!isAuthUser || !isAdmin) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
          })
        }
        return await getAdminProducts(event)
      }
      else if (url && url.startsWith('s/')) {
        // GET /api/products/s/[slug]
        return await getProductBySlug(event)
      }
      else if (url) {
        // GET /api/products/[id]
        return await getProductById(event)
      }
      else {
        // GET /api/products
        return await getProducts()
      }

    case 'POST':
      // POST /api/products
      await onlyAuthUser(event)
      await onlyAdmin(event)
      return await createProduct(event)

    case 'PATCH':
      // PATCH /api/products/[id]
      await onlyAuthUser(event)
      await onlyAdmin(event)
      await deleteImages(event)
      return await updateProduct(event)

    case 'DELETE':
      if (url && url.startsWith('ProdImage/')) {
        // DELETE /api/products/ProdImage/[id]
        await onlyAuthUser(event)
        await onlyAdmin(event)
        return await deleteProductImage(event)
      }
      else {
        // DELETE /api/products/[id]
        await onlyAuthUser(event)
        await onlyAdmin(event)
        await deleteImages(event)
        return await deleteProduct(event)
      }

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
  }
})
