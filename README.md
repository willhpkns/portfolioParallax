# Portfolio Website with Admin Panel

A modern, full-stack portfolio website featuring a parallax design, comprehensive content management system, and visitor analytics.

## 🚀 Features

### Frontend
- **Parallax Background** - Dynamic, engaging scrolling effects
- **Responsive Design** - Mobile-first approach using TailwindCSS
- **Interactive Sections**
  - About section with profile and bio
  - Projects showcase with image support
  - Skills presentation with categorization
  - Contact form integration
  - Interactive resume with customizable sections

### Admin Panel
- **Content Management**
  - About section editor
  - Projects manager with image upload
  - Education history manager
  - Experience timeline editor
  - Skills manager with categories
- **Resume Customization**
  - Drag-and-drop section reordering
  - Preview mode for resume
- **Analytics Dashboard**
  - Visitor tracking
  - Page view statistics
  - User engagement metrics

## 🛠️ Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context
- **Form Handling**: React Hook Form
- **Drag & Drop**: DND Kit
- **Maps**: React Simple Maps
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Email Integration**: EmailJS

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**:
  - CORS configuration
  - Rate limiting
  - Input validation
- **Analytics**: Custom visitor tracking system

## 🏗️ Project Structure

```
project/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── pages/           # Page components
│   │   └── admin/       # Admin panel pages
│   └── services/        # API service integrations
│
backend/
├── middleware/          # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
└── scripts/            # Utility scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- EmailJS account (for contact form)

### Environment Variables

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_EMAILJS_USER_ID=your_emailjs_user_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
```

#### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd project && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. Configure environment variables:

Backend (create `.env` from template):
```bash
cd backend
cp .env.example .env
# Edit .env with your settings:
# - MONGODB_URI
# - JWT_SECRET
# - ADMIN_USERNAME
# - ADMIN_PASSWORD
```

Frontend development and production environments are pre-configured with API URLs.

4. Initialize admin user:
```bash
cd backend
npm run init-admin
```

5. Running the application:

Development mode (from root directory):
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run individually:
npm run frontend  # Frontend on http://localhost:5173
npm run backend   # Backend on http://localhost:5000
```

Production mode (from root directory):
```bash
# Build frontend and run both servers in production
npm run prod

# Or run steps individually:
npm run frontend:build   # Build frontend
npm run frontend:start   # Serve frontend on http://localhost:3000
npm run backend:prod     # Run backend in production mode
```

## 🚀 Production Deployment

### Server Configuration

The production setup uses:
- Express server (port 3000) to serve the built frontend
- Backend API server (port 5000)
- Nginx as reverse proxy

### Nginx Configuration

The included `nginx.conf` provides:
- Reverse proxy to Express server
- WebSocket support
- Real IP forwarding
- HTTP upgrade handling

Example configuration:
```nginx
server {
    listen 80;
    server_name willhpkns.soon.it;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Health Monitoring

- Health check endpoint: `GET /health`
- Automatic keep-alive mechanism
- Process event handling for uncaught exceptions
- Graceful shutdown support

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Content Management
- `GET /api/content/about` - Get about information
- `POST /api/content/about` - Update about section
- `GET/POST/PUT/DELETE /api/content/projects` - Projects CRUD
- `GET/POST/PUT/DELETE /api/content/education` - Education CRUD
- `GET/POST/PUT/DELETE /api/content/experience` - Experience CRUD
- `GET/POST/PUT/DELETE /api/content/skills` - Skills CRUD

### Analytics
- `POST /api/analytics/track` - Track page views
- `GET /api/analytics/stats` - Get visitor statistics

## 🔐 Security Features

- JWT-based authentication
- Protected admin routes
- CORS configuration
- Input validation
- Rate limiting for API endpoints
- Secure password hashing

## 🔄 State Management

- React Context for auth state
- Protected routes with role-based access
- Centralized API service layer
- Real-time form validation
- Toast notifications for user feedback

## 📈 Analytics Features

- Page view tracking
- Visitor statistics
- User engagement metrics
- Geographic data collection
- Custom event tracking

## 🎨 Styling and UI

- Responsive design with Tailwind CSS
- Custom parallax effects
- Smooth scroll animations
- Dark/light mode support
- Custom UI components
- Interactive visualizations

## 📱 Mobile Responsiveness

- Mobile-first approach
- Responsive navigation
- Touch-friendly interactions
- Optimized images
- Fluid typography

## 🔧 Development Features

- Hot module replacement
- TypeScript support
- ESLint configuration
- Development/Production environments
- Automated build process
- Source maps for debugging

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
