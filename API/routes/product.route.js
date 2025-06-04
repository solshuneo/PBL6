const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth');

router.post('/', authenticateUser, authorizeAdmin, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.put('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
}
);
module.exports = router;
