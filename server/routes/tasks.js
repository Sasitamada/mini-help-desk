const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/tasks');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to log task history
async function logTaskHistory(pool, taskId, userId, action, fieldName = null, oldValue = null, newValue = null) {
  try {
    await pool.query(
      `INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [taskId, userId, action, fieldName, oldValue ? JSON.stringify(oldValue) : null, newValue ? JSON.stringify(newValue) : null]
    );
  } catch (error) {
    console.error('Error logging task history:', error);
  }
}

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { projectId, workspaceId, status, priority, search, tag, assignedTo } = req.query;
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
    if (assignedTo) {
      query += ` AND assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await req.app.locals.pool.query(query, params);
    
    // Filter by tag if provided
    let filteredRows = rows;
    if (tag) {
      filteredRows = rows.filter(task => {
        const tags = Array.isArray(task.tags) ? task.tags : (task.tags ? JSON.parse(task.tags) : []);
        return tags.some(t => t.toLowerCase().includes(tag.toLowerCase()));
      });
    }
    
    res.json(filteredRows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task with history
router.get('/:id', async (req, res) => {
  try {
    const taskResult = await req.app.locals.pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (taskResult.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    
    const task = taskResult.rows[0];
    
    // Get task history
    const historyResult = await req.app.locals.pool.query(
      `SELECT th.*, u.username, u.full_name, u.avatar
       FROM task_history th
       LEFT JOIN users u ON th.user_id = u.id
       WHERE th.task_id = $1
       ORDER BY th.created_at DESC`,
      [req.params.id]
    );
    
    // Get reminders
    const remindersResult = await req.app.locals.pool.query(
      'SELECT * FROM task_reminders WHERE task_id = $1 ORDER BY reminder_date ASC',
      [req.params.id]
    );
    
    res.json({
      ...task,
      history: historyResult.rows,
      reminders: remindersResult.rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, project, workspace, assignedTo, status, priority, dueDate, createdBy, subtasks, tags, reminders } = req.body;
    const { rows } = await req.app.locals.pool.query(
      `INSERT INTO tasks (title, description, project_id, workspace_id, assigned_to, status, priority, due_date, created_by, subtasks, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        title, description, project, workspace, assignedTo, 
        status || 'todo', priority || 'medium', dueDate, createdBy, 
        JSON.stringify(subtasks || []), 
        JSON.stringify(tags || [])
      ]
    );
    
    const task = rows[0];
    
    // Log creation
    if (createdBy) {
      await logTaskHistory(req.app.locals.pool, task.id, createdBy, 'created', null, null, { title, status, priority });
    }
    
    // Create reminders if provided
    if (reminders && Array.isArray(reminders)) {
      for (const reminderDate of reminders) {
        await req.app.locals.pool.query(
          'INSERT INTO task_reminders (task_id, user_id, reminder_date) VALUES ($1, $2, $3)',
          [task.id, assignedTo || createdBy, reminderDate]
        );
      }
    }
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, subtasks, tags, userId } = req.body;
    const taskId = req.params.id;
    
    // Get current task to compare changes
    const currentTask = await req.app.locals.pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (currentTask.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const oldTask = currentTask.rows[0];
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (title !== undefined && title !== oldTask.title) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'title', oldTask.title, title);
    }
    if (description !== undefined && description !== oldTask.description) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'description', oldTask.description, description);
    }
    if (status !== undefined && status !== oldTask.status) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'status', oldTask.status, status);
    }
    if (priority !== undefined && priority !== oldTask.priority) {
      updates.push(`priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'priority', oldTask.priority, priority);
    }
    if (dueDate !== undefined && dueDate !== oldTask.due_date) {
      updates.push(`due_date = $${paramIndex}`);
      values.push(dueDate);
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'due_date', oldTask.due_date?.toString(), dueDate);
    }
    if (assignedTo !== undefined && assignedTo !== oldTask.assigned_to) {
      updates.push(`assigned_to = $${paramIndex}`);
      values.push(assignedTo);
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'assigned_to', oldTask.assigned_to?.toString(), assignedTo?.toString());
    }
    if (subtasks !== undefined) {
      updates.push(`subtasks = $${paramIndex}`);
      values.push(JSON.stringify(subtasks));
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'subtasks', oldTask.subtasks, subtasks);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      values.push(JSON.stringify(tags));
      paramIndex++;
      if (userId) await logTaskHistory(req.app.locals.pool, taskId, userId, 'updated', 'tags', oldTask.tags, tags);
    }
    
    if (updates.length === 0) {
      const { rows } = await req.app.locals.pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
      return res.json(rows[0]);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);
    
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const { rows } = await req.app.locals.pool.query(query, values);
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;
    
    // Log deletion
    if (userId) {
      await logTaskHistory(req.app.locals.pool, taskId, userId, 'deleted', null, null, null);
    }
    
    await req.app.locals.pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload attachment
router.post('/:id/attachments', upload.array('files', 10), async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId } = req.body;
    
    // Get current attachments
    const taskResult = await req.app.locals.pool.query('SELECT attachments FROM tasks WHERE id = $1', [taskId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const currentAttachments = taskResult.rows[0].attachments || [];
    const newAttachments = req.files.map(file => ({
      filename: file.originalname,
      path: `/uploads/tasks/${file.filename}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId
    }));
    
    const allAttachments = [...(Array.isArray(currentAttachments) ? currentAttachments : JSON.parse(currentAttachments || '[]')), ...newAttachments];
    
    await req.app.locals.pool.query(
      'UPDATE tasks SET attachments = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(allAttachments), taskId]
    );
    
    if (userId) {
      await logTaskHistory(req.app.locals.pool, taskId, userId, 'added_attachment', 'attachments', null, newAttachments.map(a => a.filename).join(', '));
    }
    
    res.json({ message: 'Files uploaded', attachments: allAttachments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attachment
router.delete('/:id/attachments/:filename', async (req, res) => {
  try {
    const { id, filename } = req.params;
    const { userId } = req.body;
    
    const taskResult = await req.app.locals.pool.query('SELECT attachments FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const attachments = taskResult.rows[0].attachments || [];
    const filtered = attachments.filter(att => {
      const attObj = typeof att === 'string' ? JSON.parse(att) : att;
      return attObj.filename !== filename && attObj.path !== `/uploads/tasks/${filename}`;
    });
    
    // Delete file from filesystem
    const attachmentToDelete = attachments.find(att => {
      const attObj = typeof att === 'string' ? JSON.parse(att) : att;
      return attObj.filename === filename || attObj.path === `/uploads/tasks/${filename}`;
    });
    
    if (attachmentToDelete) {
      const filePath = path.join(__dirname, '../', attachmentToDelete.path || attachmentToDelete);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await req.app.locals.pool.query(
      'UPDATE tasks SET attachments = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(filtered), id]
    );
    
    if (userId) {
      await logTaskHistory(req.app.locals.pool, id, userId, 'removed_attachment', 'attachments', filename, null);
    }
    
    res.json({ message: 'Attachment deleted', attachments: filtered });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add reminder
router.post('/:id/reminders', async (req, res) => {
  try {
    const { reminderDate, userId } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO task_reminders (task_id, user_id, reminder_date) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, userId, reminderDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get task history
router.get('/:id/history', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query(
      `SELECT th.*, u.username, u.full_name, u.avatar
       FROM task_history th
       LEFT JOIN users u ON th.user_id = u.id
       WHERE th.task_id = $1
       ORDER BY th.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
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