const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://mini-help-desk-1.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// ✅ Set correct CORS for API
app.use(cors({
  origin: 'https://mini-help-desk-1.onrender.com'
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => {
    console.log('PostgreSQL connected successfully');
    createTables();
  })
  .catch(err => console.error('Database connection error:', err));

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS workspaces (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS projects (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS tasks (...)`);
    await client.query(`DO $$ BEGIN IF NOT EXISTS (...) THEN ALTER TABLE tasks ADD COLUMN tags JSONB DEFAULT '[]'; END IF; END $$;`);
    await client.query(`CREATE TABLE IF NOT EXISTS comments (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS users (...)`);
    await client.query(`DO $$ BEGIN IF NOT EXISTS (...) THEN ALTER TABLE users ADD COLUMN bio TEXT; END IF; IF NOT EXISTS (...) THEN ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; END IF; END $$;`);
    await client.query(`CREATE TABLE IF NOT EXISTS workspace_members (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS workspace_invitations (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS task_tags (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS task_history (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS task_reminders (...)`);
    await client.query(`CREATE TABLE IF NOT EXISTS workspace_chat_messages (...)`);
    console.log('Database tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
  }
}

app.locals.pool = pool;

// Routes
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workspace-invitations', require('./routes/workspaceInvitations'));
app.use('/api/workspace-chat', require('./routes/workspaceChat'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Sockets
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-task', (taskId) => {
    socket.join(`task-${taskId}`);
  });

  socket.on('leave-task', (taskId) => {
    socket.leave(`task-${taskId}`);
  });

  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.locals.io = io;

// ✅ Test DB endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0].now });
  } catch (err) {
    console.error('Test DB connection failed:', err);
    res.status(500).json({ error: 'Database connection error' });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
