const express = require('express');
const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { projectId, workspaceId, status, priority, search } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (projectId) {
      query += ` AND project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }
    if (workspaceId) {
      query += ` AND workspace_id = $${paramIndex}`;
      params.push(workspaceId);
      paramIndex++;
    }
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (priority) {
      query += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await req.app.locals.pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, project, workspace, assignedTo, status, priority, dueDate, createdBy, subtasks } = req.body;
    const { rows } = await req.app.locals.pool.query(
      `INSERT INTO tasks (title, description, project_id, workspace_id, assigned_to, status, priority, due_date, created_by, subtasks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, description, project, workspace, assignedTo, status, priority, dueDate, createdBy, JSON.stringify(subtasks || [])]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, subtasks } = req.body;
    const { rows } = await req.app.locals.pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, assigned_to = $6,
       subtasks = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *`,
      [title, description, status, priority, dueDate, assignedTo, JSON.stringify(subtasks), req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update tasks (for kanban drag-drop)
router.put('/bulk/update', async (req, res) => {
  try {
    const { tasks } = req.body;
    const client = await req.app.locals.pool.connect();
    try {
      await client.query('BEGIN');
      for (const task of tasks) {
        await client.query(
          'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [task.status, task.id]
        );
      }
      await client.query('COMMIT');
      res.json({ message: 'Tasks updated' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;