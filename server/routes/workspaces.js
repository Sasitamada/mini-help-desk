const express = require('express');
const router = express.Router();

// Get all workspaces
router.get('/', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query('SELECT * FROM workspaces ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single workspace
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query('SELECT * FROM workspaces WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Workspace not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create workspace
router.post('/', async (req, res) => {
  try {
    const { name, description, color, owner } = req.body;
    const { rows } = await req.app.locals.pool.query(
      'INSERT INTO workspaces (name, description, color, owner) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, color || '#7b68ee', owner]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update workspace
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const { rows } = await req.app.locals.pool.query(
      'UPDATE workspaces SET name = $1, description = $2, color = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, color, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete workspace
router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM workspaces WHERE id = $1', [req.params.id]);
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;