const express = require('express');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Check if user exists
    const existingUser = await req.app.locals.pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (in production, hash password)
    const result = await req.app.locals.pool.query(
      'INSERT INTO users (username, email, password, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, password, fullName]
    );

    const user = result.rows[0];
    res.status(201).json({ 
      message: 'User created', 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.full_name 
      },
      token: 'dummy-token-' + user.id
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await req.app.locals.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        fullName: user.full_name 
      },
      token: 'dummy-token-' + user.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
