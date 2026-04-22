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
import { createProject, getProjects } from '~~/server/controllers/project'

// GET /api/products
export default defineEventHandler(async (event) => {
  const method = event.method
  const url = getRouterParam(event, 'slug') || getRouterParam(event, 'id')

  switch (method) {
    case 'GET':
      // GET /api/products
      return await getProjects()

    case 'POST':
      // POST /api/products
      await onlyAuthUser(event)
      await onlyAdmin(event)
      return await createProject(event)

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
  }
})
