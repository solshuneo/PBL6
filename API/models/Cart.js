const mongoose = require('mongoose');

const productInCartSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount:    { type: Number, required: true, min: 1 }
});

const cartSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [productInCartSchema],
  count:    { type: Number, default: 0 }, // Tổng số lượng item trong cart
  paid:     { type: Boolean, default: false }
});

module.exports = mongoose.model('Cart', cartSchema);
