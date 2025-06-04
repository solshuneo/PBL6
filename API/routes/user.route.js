const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Đăng ký user mới (role mặc định là 'user')
router.post('/register', async (req, res) => {
  try {
    const { displayName, phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ displayName, phone, password: hashedPassword });
    await user.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Đăng nhập và trả về token JWT
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: 'Invalid phone or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid phone or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, displayName: user.displayName, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy thông tin user hiện tại (yêu cầu đăng nhập)
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách tất cả users (chỉ admin mới được xem)
router.get('/', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa user theo id (chỉ admin)
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
