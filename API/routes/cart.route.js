const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth');

// Tạo giỏ hàng cho user nếu chưa có
router.post('/', authenticateUser, async (req, res) => {
  try {
    const existing = await Cart.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'Cart already exists for this user' });
    }

    const cart = new Cart({ userId: req.user.id, products: [], count: 0 });
    await cart.save();

    res.json({ message: 'Cart created', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy giỏ hàng hiện tại của user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm sản phẩm vào giỏ
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const existing = cart.products.find(p => p.productId.toString() === productId);
    if (existing) {
      existing.amount += amount;
    } else {
      cart.products.push({ productId, amount });
    }

    cart.count = cart.products.reduce((sum, item) => sum + item.amount, 0);
    await cart.save();

    res.json({ message: 'Product added', cart });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ
router.put('/update', authenticateUser, async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.products.find(p => p.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: 'Product not found in cart' });

    item.amount = amount;
    cart.count = cart.products.reduce((sum, item) => sum + item.amount, 0);
    await cart.save();

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xóa sản phẩm khỏi giỏ
router.delete('/remove/:productId', authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    cart.count = cart.products.reduce((sum, item) => sum + item.amount, 0);
    await cart.save();

    res.json({ message: 'Product removed', cart });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Đánh dấu giỏ hàng là đã thanh toán
router.put('/checkout', authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.paid = true;
    await cart.save();

    res.json({ message: 'Checkout completed', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy tất cả giỏ hàng (chỉ admin)
router.get('/', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const carts = await Cart.find().populate('userId').populate('products.productId');
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
