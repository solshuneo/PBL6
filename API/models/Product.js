const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  urlImage:    { type: String },
  description: { type: String },
  total:       { type: Number, required: true },
  used:        { type: Number, default: 0 },
  price:       { type: Number, required: true }
});

module.exports = mongoose.model('Product', productSchema);
