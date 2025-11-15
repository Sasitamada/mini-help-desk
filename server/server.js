// /server/server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Determine environment / production detection
const hasDatabaseUrl = !!process.env.DATABASE_URL;
const isProduction = (process.env.NODE_ENV === 'production') || hasDatabaseUrl;

// CORS - allow frontend host in production, localhost in dev
const frontendOrigin = isProduction
  ? 'https://mini-help-desk-1.onrender.com'
  : 'http://localhost:3000';

app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));

// Socket.IO CORS setup
const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Build connection string from DATABASE_URL OR DB_* env vars
const connectionString = process.env.DATABASE_URL || (() => {
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'postgres';
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
})();

// Pool config: disable SSL for local, enable minimal SSL for production managed DBs
const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

console.log('DB connection mode:', isProduction ? 'production (SSL enabled)' : 'development (SSL disabled)');
console.log('Using frontend origin:', frontendOrigin);

pool.connect()
  .then(() => {
    console.log('PostgreSQL connected successfully');
    createTables();
  })
  .catch(err => console.error('Database connection error:', err));

// Create tables function with concrete schemas
async function createTables() {
  const client = await pool.connect();
  try {
    // 1. users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        bio TEXT,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. workspaces
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. workspace_members
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id BIGSERIAL PRIMARY KEY,
        workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (workspace_id, user_id)
      );
    `);

    // 4. workspace_invitations
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspace_invitations (
        id BIGSERIAL PRIMARY KEY,
        workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        invited_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        token VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id BIGSERIAL PRIMARY KEY,
        workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. tasks
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'normal',
        assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        reporter_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        due_date TIMESTAMP WITH TIME ZONE,
        tags JSONB DEFAULT '[]'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. task_tags (optional mapping table if you want tag normalization)
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_tags (
        id BIGSERIAL PRIMARY KEY,
        task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL,
        UNIQUE (task_id, tag)
      );
    `);

    // 8. comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id BIGSERIAL PRIMARY KEY,
        task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        attachments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. task_history
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_history (
        id BIGSERIAL PRIMARY KEY,
        task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        change JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. task_reminders
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_reminders (
        id BIGSERIAL PRIMARY KEY,
        task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
        remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
        method VARCHAR(50) DEFAULT 'email',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. workspace_chat_messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspace_chat_messages (
        id BIGSERIAL PRIMARY KEY,
        workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        attachments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
  }
}

app.locals.pool = pool;

// Routes - adjust these requires if route files aren't present yet
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

// Socket.IO
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

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
