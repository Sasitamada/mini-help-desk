const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/:workspaceId', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query(
      'SELECT * FROM workspace_chat_messages WHERE workspace_id = $1 ORDER BY created_at ASC',
      [req.params.workspaceId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:workspaceId', upload.array('attachments'), async (req, res) => {
  try {
    const { author, message } = req.body;
    const workspaceId = req.params.workspaceId;

    const attachments = (req.files || []).map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: `/uploads/chat/${file.filename}`
    }));

    const { rows } = await req.app.locals.pool.query(
      'INSERT INTO workspace_chat_messages (workspace_id, author, message, attachments) VALUES ($1, $2, $3, $4) RETURNING *',
      [workspaceId, author, message, JSON.stringify(attachments)]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:workspaceId/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    const workspaceId = req.params.workspaceId;

    const { rows } = await req.app.locals.pool.query(
      'SELECT * FROM tasks WHERE workspace_id = $1',
      [workspaceId]
    );

    const totalTasks = rows.length;
    const completedTasks = rows.filter(task => task.status === 'done').length;
    const inProgress = rows.filter(task => task.status === 'inprogress').length;

    const response = `Here's what I found:\n- Total tasks: ${totalTasks}\n- Completed: ${completedTasks}\n- In progress: ${inProgress}\n\nBased on your prompt "${prompt}", consider focusing on the tasks that are still in progress. Let me know if you'd like a breakdown by priority.`;

    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
