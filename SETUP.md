# MiniHelpDesk - Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

Run this command in the root directory:
```bash
npm run install-all
```

Or manually:
```bash
cd server
npm install
cd ../client
npm install
```

### Step 2: Start MongoDB

Make sure MongoDB is running on your system:
- Local MongoDB: `mongodb://localhost:27017`
- Or use MongoDB Atlas (cloud)

### Step 3: Start the Application

#### Option A: Start Both Server and Client (Manual)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

#### Option B: Start Each Separately in Different Terminals

Server will run on: `http://localhost:5000`
Client will run on: `http://localhost:3000`

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

You're ready to use MiniHelpDesk! 🎉

---

## 📝 Creating Your First Workspace

1. Click on the sidebar or navigate to "Workspaces"
2. Click the "+ New Workspace" button
3. Enter a workspace name and description
4. Click "Create Workspace"
5. Select your workspace
6. Create a project within the workspace
7. Start adding tasks!

---

## 🛠️ Troubleshooting

### MongoDB Connection Issues

If you see "MongoDB connection error":
1. Make sure MongoDB is installed and running
2. Check the connection string in `server/.env`
3. For local MongoDB: `mongodb://localhost:27017/minihelpdesk`

### Port Already in Use

If you get "port already in use" errors:
- Change the port in `server/.env` (for backend)
- Or change it in `client/package.json` scripts (for frontend)

### Missing Dependencies

If you see module errors:
```bash
cd server
npm install
cd ../client
npm install
```

---

## 📦 Project Structure

```
minihelpdesk/
├── client/          # React Frontend
│   ├── src/        # Source code
│   └── public/     # Static files
│
├── server/         # Express Backend
│   ├── models/     # Database models
│   ├── routes/     # API routes
│   └── server.js   # Entry point
│
├── README.md       # Full documentation
└── SETUP.md        # This file
```

---

## 🎯 What You Can Do

✅ Create workspaces and projects
✅ Add tasks with details
✅ Drag and drop tasks on Kanban board
✅ Add comments to tasks
✅ Create subtasks
✅ Set priorities and due dates
✅ View dashboard with statistics
✅ Filter and search tasks

---

Enjoy building with MiniHelpDesk! 🚀
