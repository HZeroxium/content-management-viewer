# 📄 Content Management and Viewer Application

## Project Overview

This content management system allows for role-based control of content creation and delivery:

- **Admins**: Manage user accounts and assign roles
- **Editors**: Create and edit content with various block types
- **Clients**: View content on a public website with real-time updates

## System Architecture

This project consists of three main components:

| Component       | Technology | Description                                                       |
| --------------- | ---------- | ----------------------------------------------------------------- |
| Backend API     | NestJS     | Handles authentication, content management, and real-time updates |
| Admin Dashboard | Next.js    | Interface for admins and editors to manage users and content      |
| Client Frontend | React.js   | Public-facing site for clients to view published content          |

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose
- Git

## Project Setup

### Option 1: Quick Start with Docker (Recommended)

This is the easiest way to get the entire application running with all dependencies.

#### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/content-management.git
cd content-management
```

#### 2. Configure Environment Variables

```bash
cp .env.example .env  # Configure Docker Compose environment variables
```

Edit the `.env` file to set your JWT secret and optional DigitalOcean Spaces configuration:

```bash
# Required: Change this to a secure secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT expiration time
JWT_EXPIRES_IN=7d

# Optional: DigitalOcean Spaces configuration for file uploads
SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
SPACES_KEY=your-spaces-key
SPACES_SECRET=your-spaces-secret
SPACES_BUCKET=your-bucket-name
```

#### 3. Start All Services

```bash
# Build and start all services
docker-compose up --build -d

# Or just start if already built
docker-compose up -d
```

This will start all services:

- **MongoDB** (localhost:27017) - Database
- **Redis** (localhost:6379) - Session storage and caching
- **Backend API** (localhost:3001) - NestJS API server
- **Admin Dashboard** (localhost:3000) - Next.js admin interface

#### 4. Access the Application

- **Admin Dashboard**: <http://localhost:3000>
- **Backend API**: <http://localhost:3001>
- **API Health Check**: <http://localhost:3001/health>

#### 5. View Logs

```bash
# View all services logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f admin-dashboard
```

#### 6. Stop Services

```bash
docker-compose down
```

#### 7. Rebuild After Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build admin-dashboard

# Rebuild and restart all services
docker-compose up --build -d
```

### Option 2: Manual Development Setup

If you prefer to run services individually for development:

#### 1. Start Required Services

```bash
docker-compose up -d redis mongodb
```

This will start MongoDB and Redis services in detached mode.

#### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Create and configure your environment variables
npm run start:dev
```

The backend service will be available at <http://localhost:3001>

#### 3. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
cp .env.example .env  # Create and configure your environment variables
npm run dev
```

The admin dashboard will be available at <http://localhost:3000>

## Development Workflow

### Backend (NestJS)

The backend handles API requests, authentication, and database interactions. For detailed information:

```bash
cd backend
npm run start:dev  # Run in development mode with hot reload
```

See [Backend README](./backend/README.md) for more details.

### Admin Dashboard (Next.js)

The admin dashboard provides interfaces for user management and content editing:

```bash
cd admin-dashboard
npm run dev  # Run in development mode with hot reload
```

See [Admin Dashboard README](./admin-dashboard/README.md) for more details.

## Deployment

### Using Docker Compose (Production)

For production deployment, use:

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

### Manual Deployment

For manual deployment instructions, refer to each component's README:

- [Backend Deployment](./backend/README.md#Deployment)
- [Admin Dashboard Deployment](./admin-dashboard/README.md#Deploy-on-Vercel)

## Features

- **Authentication**: JWT with Redis for session storage
- **User Management**: CRUD operations for user accounts with role-based access control
- **Content Management**: Create, edit, and publish content with different block types
- **Real-time Updates**: WebSocket integration for instant content updates
- **File Storage**: Support for image and video uploads to S3 or DigitalOcean Spaces

## Troubleshooting

### Common Issues

#### Build Failed with Module Resolution Errors

If you encounter module resolution errors during the build process:

```bash
# Clean Docker cache and rebuild
docker-compose down
docker system prune -f
docker-compose up --build -d
```

#### Permission Issues on Linux/Mac

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

#### Port Already in Use

If ports 3000, 3001, 6379, or 27017 are already in use:

```bash
# Check what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Stop conflicting services or modify ports in docker-compose.yaml
```

#### Database Connection Issues

```bash
# Check if MongoDB is running properly
docker-compose logs mongodb

# Restart just the database services
docker-compose restart mongodb redis
```

#### Clear All Data (Development)

```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all project-related containers and images
docker-compose down --rmi all -v --remove-orphans

# Start fresh
docker-compose up --build -d
```
