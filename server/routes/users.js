const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query(
      'SELECT id, username, email, full_name, avatar, bio, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { fullName, bio, password, email } = req.body;
    const userId = req.params.id;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(fullName);
      paramIndex++;
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      values.push(bio);
      paramIndex++;
    }
    if (email !== undefined) {
      // Check if email is already taken
      const emailCheck = await req.app.locals.pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }
    if (req.file) {
      // Delete old avatar if exists
      const userResult = await req.app.locals.pool.query(
        'SELECT avatar FROM users WHERE id = $1',
        [userId]
      );
      if (userResult.rows[0]?.avatar) {
        const oldAvatarPath = path.join(__dirname, '../', userResult.rows[0].avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      updates.push(`avatar = $${paramIndex}`);
      values.push(avatarPath);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, full_name, avatar, bio, created_at`;
    const { rows } = await req.app.locals.pool.query(query, values);
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users (for workspace member search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, username, email, full_name, avatar FROM users WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1)';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY username LIMIT 50';
    const { rows } = await req.app.locals.pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

