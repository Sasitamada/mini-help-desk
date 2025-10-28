# Database Setup Instructions

## Important: Database Connection

Your NeonDB PostgreSQL database is already configured in the code, but you need to create a `.env` file in the `server` folder.

## Steps to Set Up Database:

### 1. Create `.env` file in `server/` folder

Create a file named `.env` (not `.env.txt`) in the `server` folder with this content:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_bnDM2fCkcxQ5@ep-royal-wave-a8ux8dyh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
JWT_SECRET=minihelpdesk_super_secret_jwt_key_2024_change_this_in_production
```

### 2. Start the Server

The server will automatically:
- Connect to your NeonDB PostgreSQL database
- Create all necessary tables
- Be ready to store your data

### 3. Test the Connection

Run the server:
```bash
cd server
npm start
```

You should see:
```
PostgreSQL/Neon connected successfully
Database tables created or already exist
Server running on port 5000
```

## Database Tables Created:

1. `workspaces` - Your workspaces
2. `projects` - Projects within workspaces  
3. `tasks` - Tasks within projects
4. `comments` - Comments on tasks
5. `users` - User accounts

All data will be saved permanently in your NeonDB database!

## Troubleshooting:

If you get connection errors:
1. Make sure the `.env` file exists in the `server` folder
2. Check that the connection string is correct
3. Verify NeonDB is accessible from your network
