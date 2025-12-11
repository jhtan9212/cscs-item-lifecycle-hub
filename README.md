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
└── CODING_STANDARDS.md    # Coding standards documentation
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