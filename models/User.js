const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    // return cp.productId === product._id; // === treats both sides as string even if the _id is not a string
    // so we can convert both sides to string and then compare using === or we can directy compare with ==
    return cp.productId.toString() === product._id.toString();
  });

  const updatedCartItems = [...this.cart.items];

  console.log(updatedCartItems);

  if (cartProductIndex >= 0) {
    // update the cart if product already exist i.e increase quantity
    const newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    // creating a new cart as the product does not already exist
    updatedCartItems.push({
      productId: product._id,
      quantity: 1,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;



  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (i) => i.productId.toString() !== productId.toString()
  );

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);