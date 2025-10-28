const express = require('express');
const router = express.Router();

// Get all comments for a task
router.get('/task/:taskId', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query(
      'SELECT * FROM comments WHERE task_id = $1 ORDER BY created_at DESC',
      [req.params.taskId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single comment
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query('SELECT * FROM comments WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create comment
router.post('/', async (req, res) => {
  try {
    const { content, task, author, attachments } = req.body;
    const { rows } = await req.app.locals.pool.query(
      'INSERT INTO comments (content, task_id, author, attachments) VALUES ($1, $2, $3, $4) RETURNING *',
      [content, task, author, JSON.stringify(attachments || [])]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update comment
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const { rows } = await req.app.locals.pool.query(
      'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [content, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;