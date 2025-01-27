# Portfolio Backend

Backend server for the portfolio admin panel with MongoDB database.

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. npm (v6 or higher)

## Setup Instructions

1. Install MongoDB
   - Download and install MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Start MongoDB service

2. Install dependencies
   ```bash
   npm install
   ```

3. Environment Configuration
   - Copy `.env.example` to `.env`
   - Update environment variables as needed
   ```bash
   cp .env.example .env
   ```

4. Initialize Admin User
   ```bash
   npm run init-admin
   ```
   This will create an admin user with credentials from your .env file

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Admin login
- GET `/api/auth/verify` - Verify JWT token

### Content Management (Protected Routes)
All content management routes require JWT authentication token in the header:
`Authorization: Bearer <your_token>`

#### About
- GET `/api/content/about` - Get about section
- POST `/api/content/about` - Update about section

#### Projects
- GET `/api/content/projects` - List all projects
- POST `/api/content/projects` - Create new project
- PUT `/api/content/projects/:id` - Update project
- DELETE `/api/content/projects/:id` - Delete project

#### Education
- GET `/api/content/education` - List education entries
- POST `/api/content/education` - Add education entry
- PUT `/api/content/education/:id` - Update education entry
- DELETE `/api/content/education/:id` - Delete education entry

#### Experience
- GET `/api/content/experience` - List experience entries
- POST `/api/content/experience` - Add experience entry
- PUT `/api/content/experience/:id` - Update experience entry
- DELETE `/api/content/experience/:id` - Delete experience entry

#### Skills
- GET `/api/content/skills` - List skills
- POST `/api/content/skills` - Add skills category
- PUT `/api/content/skills/:id` - Update skills category
- DELETE `/api/content/skills/:id` - Delete skills category

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/portfolio |
| JWT_SECRET | Secret key for JWT tokens | - |
| JWT_EXPIRES_IN | JWT token expiration | 24h |
| ADMIN_USERNAME | Admin login username | admin |
| ADMIN_PASSWORD | Admin login password | admin123 |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
