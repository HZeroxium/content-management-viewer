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

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/content-management.git
cd content-management
```

### 2. Start Required Services

The project uses MongoDB for data storage and Redis for session management and real-time features.

```bash
docker-compose up -d
```

This will start MongoDB and Redis services in detached mode.

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Create and configure your environment variables
npm run start:dev
```

The backend service will be available at http://localhost:3001

### 4. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
cp .env.example .env  # Create and configure your environment variables
npm run dev
```

The admin dashboard will be available at http://localhost:3000

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
