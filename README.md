# Item Lifecycle Hub Platform

A comprehensive project management platform for managing item lifecycles with role-based access control, workflow management, and audit logging.

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **React Router v7** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🏛️ Architecture

The platform follows a **3-tier architecture** with clear separation of concerns:

```
Frontend (React) → Backend (Express) → Database (PostgreSQL)
```

### Key Components

- **Frontend**: React 19 with TypeScript, component-based architecture with protected routes
- **Backend**: Express.js REST API with service layer for business logic
- **Database**: PostgreSQL with Prisma ORM for type-safe database access
- **Core Services**: WorkflowEngine, EventService, NotificationService, TaskService, VersionService

## 📁 Project Structure

```
cscs_poc/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── lib/            # Library configs
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema & migrations
│   └── package.json
```

## 🚀 Getting Started

### Local Setup with Docker

**Prerequisites:** Docker (20.10+) and Docker Compose (2.0+)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd Item-Lifecycle-Hub
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Local Setup without Docker

**Prerequisites:** Node.js 18+, npm, PostgreSQL 14+

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma migrate dev
   npm run prisma:seed
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

## 📝 Environment Variables

**Docker:** Create `.env` in root directory (see `.env.example`)

**Manual:** Create `.env` files in `backend/` and `frontend/` directories

## 🛠️ Database Management

**Docker:**
```bash
docker-compose exec backend npx prisma migrate dev    # Run migrations
docker-compose exec backend npm run prisma:seed       # Seed database
docker-compose exec backend npx prisma studio         # Open Prisma Studio
```

**Manual:**
```bash
cd backend
npx prisma migrate dev    # Run migrations
npm run prisma:seed      # Seed database
npx prisma studio        # Open Prisma Studio
```

## 🧹 Linting & Formatting

**Frontend (Docker):**
```bash
docker-compose exec frontend npm run lint          # Check for linting errors
docker-compose exec frontend npm run lint:fix       # Fix linting errors
docker-compose exec frontend npm run format        # Format code with Prettier
docker-compose exec frontend npm run format:check  # Check formatting
docker-compose exec frontend npm run type-check    # TypeScript type checking
```

**Frontend (Manual):**
```bash
cd frontend
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check formatting
npm run type-check    # TypeScript type checking
```

## 📋 Part 2: Advanced POC Implementation

### A. Full Lifecycle Modeling ✅

Supports all three lifecycle types with role-based workflows:
- **New Item** (8 stages): Draft → Freight Strategy → Supplier Pricing → KINEXO Pricing → CM Approval → SSM Approval → In Transition → Completed
- **Transitioning Item** (9 stages): Draft → Item Comparison → Freight Strategy → Supplier Pricing → KINEXO Pricing → CM Approval → SSM Approval → DC Transition → Completed
- **Deleting Item** (6 stages): Draft → Impact Analysis → SSM Review → DC Runout → Archive → Completed

Features: Role-based progression, approve/reject with comments, resubmission support, stage-specific tasks

### B. Full Role-Based Access & Privilege Model ✅

**Roles**: Category Manager, Pricing Specialist, SSM, Logistics, DC Operator, Supplier, Distributor, Admin

**RBAC**: Granular permissions, role-permission matrix, organization-level access control, protected routes and API middleware

### C. Asynchronous Business Processes ✅

**Workflow States**: DRAFT, IN_PROGRESS, WAITING_ON_SUPPLIER, WAITING_ON_DISTRIBUTOR, INTERNAL_REVIEW, COMPLETED, REJECTED

**Features**: Asynchronous event processing, notifications, automatic task creation, comments, stateful handoffs with version tracking

**Sequential Workflow**: Implements full 10-step workflow from project creation through DC transitions to completion

### D. Expanded Data Model ✅

**Core**: Users, Roles, Permissions, Organizations  
**Workflow**: Projects, Items, WorkflowSteps, LifecycleEvents  
**Collaboration**: Comments, Tasks, Notifications  
**Audit**: AuditLogs, ItemVersions, ProjectVersions  
**System**: Dashboards, User/Role Management, Organization Settings

### E. Deployment ✅

Docker Compose setup with automated database initialization, seeding, and health checks. See [Getting Started](#-getting-started) for setup instructions.

### F. Scalability & Enterprise Considerations ✅

- **Multi-Tenancy**: Organization-level data isolation
- **Event-Driven**: Asynchronous event processing with status tracking
- **Audit Logging**: Comprehensive audit trail with searchable interface
- **Version History**: Automatic versioning with full data snapshots

### G. Optional UI Enhancements ✅

Role-aware interfaces, color-coded workflow stages, dashboards with statistics, visual workflow timeline, and full lifecycle progress visualization

### H. Bonus Features ✅

Version control, comments system, task management, notifications, event system, theme support, responsive design, TypeScript type safety, RESTful API, comprehensive error handling, security (JWT, RBAC, rate limiting)