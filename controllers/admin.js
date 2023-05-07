const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");

//------------get all products
exports.getProducts = (req, res, next) => {
  Product.find()
    .then((product) => {
      res.render("admin/products", {
        prods: product,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//----------add-product route
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationError: [],
  });
};

//-----------post a new product
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: "Attached File is Not an Image",
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationError: [],
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationError: errors.array(),
    });
  }

  const imageURL = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageURL: imageURL,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Product Created");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//----------edit-product route/page
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }
  const prodID = req.params.productId;

  Product.findById(prodID)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationError: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//-------post the edited product
exports.postEditProduct = (req, res, next) => {
  const prodID = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodID,
      },
      validationError: errors.array(),
    });
  }

  Product.findById(prodID)
    .then((product) => {
      console.log(product);
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        fileHelper.deleteFile(product.imageURL);
        product.imageURL = image.path;
      }
      product.description = updatedDesc;
      product.save().then(() => {
        console.log("Product Updated");
      });
      return res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//-----------delete a product from list and cart
exports.deleteProduct = (req, res, next) => {
  const prodID = req.params.productId;
  Product.findById(prodID)
    .then((product) => {
      if (!product) {
        return next(err);
      }
      fileHelper.deleteFile(product.imageURL);
      return Product.findByIdAndRemove(prodID);
    })
    .then(() => {
      // res.redirect("/admin/products"); // used earlier
      res.status(200).json({message: 'Success'})
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);  //used earlier
      res.status(500).json({message: 'Failed'})
    });
};

