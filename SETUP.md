# Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Quick Start

### 1. Database Setup

Make sure PostgreSQL is running and create a database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cscs_poc;

# Exit
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL:
# DATABASE_URL="postgresql://username:password@localhost:5432/cscs_poc?schema=public"

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional, defaults work for local dev)
cp .env.example .env
# Edit .env if needed:
# VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Verification

1. Open `http://localhost:5173` in your browser
2. You should see the Dashboard
3. Click "Create New Project" to test the application
4. Navigate to Projects to see your created projects

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in backend/.env
- Ensure database exists: `psql -U postgres -l`

### CORS Issues
- Check CORS_ORIGIN in backend/.env matches frontend URL
- Default is `http://localhost:5173`

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Vite will prompt to use a different port

## Next Steps

- Review the [IMPLEMENTATION_APPROACH.md](./IMPLEMENTATION_APPROACH.md) for architecture details
- Check [WORKFLOW_REFERENCE.md](./WORKFLOW_REFERENCE.md) for workflow information
- See [QUICK_START.md](./QUICK_START.md) for development checklist

