# Portfolio Website with Admin Panel

A modern, full-stack portfolio website featuring a parallax design, comprehensive content management system, and visitor analytics.

## 🌟 Live Demo

- **Website**: [https://willhpkns.soon.it](https://willhpkns.soon.it)
- **Admin Panel**: [https://willhpkns.soon.it/admin](https://willhpkns.soon.it/admin)

## 🚀 Features

### 🎨 Frontend Features
- **Parallax Background** - Dynamic, engaging scrolling effects
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Interactive Sections**:
  - Hero section with animated terminal icon
  - About section with profile and bio
  - Projects showcase with image gallery
  - Skills presentation with level indicators
  - Contact form with EmailJS integration
  - Interactive resume with customizable sections
  - Pixel Board - Interactive drawing canvas

### 🔧 Admin Panel Features
- **Content Management**:
  - About section editor with paragraph management
  - Projects manager with technology tags
  - Education history with drag-and-drop ordering
  - Experience timeline editor
  - Skills manager with categories and levels
- **Resume Customization**:
  - Drag-and-drop section reordering
  - Live preview mode
- **Analytics Dashboard**:
  - Visitor tracking and statistics
  - Page view metrics
  - Geographic data visualization
- **Pixel Board Management**:
  - Real-time drawing canvas
  - Timelapse visualization
  - Settings and moderation controls

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Drag & Drop**: @dnd-kit
- **Maps**: React Simple Maps
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Email**: EmailJS integration
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: CORS, Rate limiting, Input validation
- **Analytics**: Custom visitor tracking system

## 📁 Project Structure

```
portfolio/
├── project/                    # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React context providers
│   │   ├── pages/            # Page components
│   │   │   └── admin/        # Admin panel pages
│   │   └── services/         # API service integrations
│   ├── .env.development      # Dev environment variables
│   ├── .env.production       # Production environment variables
│   └── nginx.conf            # Nginx configuration
│
├── backend/                   # Backend (Node.js/Express)
│   ├── middleware/           # Express middleware
│   ├── models/              # Mongoose database models
│   ├── routes/              # API route handlers
│   ├── scripts/             # Utility scripts
│   └── .env                 # Backend environment variables
│
├── Dockerfile               # Frontend container
├── Dockerfile.api          # Backend container
├── package.json            # Root package with scripts
└── .github/workflows/      # CI/CD deployment
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- EmailJS account (for contact form)

### 1. Clone and Install

```bash
git clone [your-repository-url]
cd portfolioParallax
npm install  # Installs all dependencies
```

### 2. Environment Setup

#### Backend Environment (Required)
Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/portfolio

# Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Environment (Optional)
The frontend environments are pre-configured, but you can customize:

**Development** (`project/.env.development`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_user_id
```

**Production** (`project/.env.production`):
```env
VITE_API_BASE_URL=https://willhpkns.soon.it/api
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_user_id
```

### 3. Database Setup

Start MongoDB and initialize the admin user:

```bash
cd backend
npm run init-admin
```

### 4. Run the Application

#### Development Mode
```bash
# From root directory - runs both frontend and backend
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# Admin Panel: http://localhost:5173/admin
```

#### Production Mode
```bash
# Build and run in production
npm run prod

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Admin Panel: http://localhost:3000/admin
```

## 🔐 Admin Panel Access

### First Time Setup

1. **Initialize Admin User**:
   ```bash
   cd backend
   npm run init-admin
   ```

2. **Access Admin Panel**:
   - Development: `http://localhost:5173/admin`
   - Production: `https://willhpkns.soon.it/admin`

3. **Login** with credentials from your `backend/.env` file

### Security Notes

- JWT tokens expire after 24 hours (secure by design)
- You'll need to log in again after token expiration
- Passwords are hashed with bcrypt
- All admin routes are protected
- CORS is configured for your domains

## 🚀 Deployment

### Docker Deployment

The project includes Docker configurations for both frontend and backend:

```bash
# Build frontend image
docker build -f Dockerfile -t portfolio-frontend .

# Build backend image  
docker build -f Dockerfile.api -t portfolio-backend .
```

### Production Server Setup

1. **Update Nginx Configuration** to proxy both frontend and API:

```nginx
server {
    listen 80;
    server_name willhpkns.soon.it;

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

2. **Run Both Services**:
   - Frontend on port 3000
   - Backend on port 5000

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Content Management (Protected Routes)
- `GET/POST /api/content/about` - About section
- `GET/POST/PUT/DELETE /api/content/projects` - Projects CRUD
- `GET/POST/PUT/DELETE /api/content/education` - Education CRUD
- `GET/POST/PUT/DELETE /api/content/experience` - Experience CRUD
- `GET/POST/PUT/DELETE /api/content/skills` - Skills CRUD

### Settings
- `GET/POST /api/content/settings/resume-order` - Resume section ordering

### Analytics
- `POST /api/analytics/track` - Track page views
- `GET /api/analytics/stats` - Get visitor statistics

## 🎨 Customization

### Styling
- Colors are defined in Tailwind config and used consistently
- Primary colors: `#2C1810` (dark brown), `#5C4B37` (medium brown), `#E6D5AC` (light beige)
- All components use these colors for consistency

### Content Management
Use the admin panel to manage:
- **About Section**: Personal info, bio paragraphs, profile image
- **Projects**: Title, description, images, technology tags
- **Education**: Institutions, degrees, dates, descriptions
- **Experience**: Companies, positions, dates, technologies
- **Skills**: Categories with items and proficiency levels
- **Resume Order**: Drag and drop to reorder sections

## 🔧 Development Commands

```bash
# Root level commands
npm run dev          # Run both frontend and backend in development
npm run frontend     # Run only frontend development server
npm run backend      # Run only backend development server
npm run build        # Build frontend for production
npm run prod         # Build and run in production mode

# Backend specific
cd backend
npm run dev          # Development with nodemon
npm run start        # Production server
npm run init-admin   # Initialize admin user

# Frontend specific  
cd project
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

1. **Can't access admin panel**:
   - Ensure you've run `npm run init-admin`
   - Check your MongoDB connection
   - Verify environment variables are set

2. **Database connection errors**:
   - Make sure MongoDB is running
   - Check your `MONGODB_URI` in `backend/.env`

3. **Admin login issues**:
   - Verify credentials in `backend/.env`
   - Check browser console for errors
   - Ensure backend is running on port 5000

4. **API not connecting**:
   - Check if backend is running
   - Verify CORS settings
   - Check environment variables for API URLs

### Logs and Debugging

- Backend logs: Check your terminal running the backend
- Frontend errors: Check browser developer console
- Database: Use MongoDB Compass or CLI to inspect data

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This is a personal portfolio website. Customize the content, styling, and features to match your personal brand and requirements.