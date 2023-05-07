const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { check } = require("express-validator");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    check("title").isString().isLength({ min: 5 }).trim(),
    check("price").isFloat().trim(),
    check("description").isLength({ min: 10, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// /admin/edit-product => GET    /------routes the page of editing product
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST   /------updates the existing product
router.post(
  "/edit-product",
  [
    check("title").isString().isLength({ min: 5 }).trim(),
    check("price").isFloat(),
    check("description").isLength({ min: 10, max: 50 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// /admin/delete-product => POST /------deletes an existing product from product list and cart
// router.post("/delete-product", isAuth, adminController.postDeleteProduct); //used earlier
router.delete('/product/:productId', isAuth, adminController.deleteProduct)

module.exports = router;
