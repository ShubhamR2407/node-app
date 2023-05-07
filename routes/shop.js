const express = require('express');

const shopControllers = require('../controllers/shop')
const isAuth = require("../middleware/is-auth") 

const router = express.Router();

router.get('/', shopControllers.getIndex);

router.get('/products', shopControllers.getProducts);

// keep it at last preference because if it is before any path like /products/---- and if /delete is called then it will trigger /product/:productID
router.get('/products/:productId', shopControllers.getProduct);  

router.get('/checkout', isAuth, shopControllers.getCheckout)

router.get('/checkout/success', isAuth, shopControllers.getCheckoutSuccess)

router.get('/checkout/cancel', isAuth, shopControllers.getCheckout)

router.get('/cart', isAuth, shopControllers.getCart);

router.post('/cart', isAuth, shopControllers.postCart);

router.post('/cart-delete-item', isAuth, shopControllers.postCartDeleteproduct);

router.get('/orders', isAuth, shopControllers.getOrders);

router.get('/orders/:orderId', isAuth, shopControllers.getInvoice);



module.exports = router;
