# Docker Setup Guide

This guide explains how to set up and run the Item Lifecycle Hub Platform using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd cscs_poc
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values as needed:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=cscs_poc
   DB_PORT=5432
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Backend Health Check: http://localhost:3000/health
   - PostgreSQL: localhost:5433 (default, configurable via DB_PORT)

## Services

### PostgreSQL Database
- **Container**: `cscs_poc_postgres`
- **Port**: 5433 (configurable via `DB_PORT`, default changed from 5432 to avoid conflicts)
- **Database**: `cscs_poc` (configurable via `DB_NAME`)
- **User**: `postgres` (configurable via `DB_USER`)
- **Password**: `postgres` (configurable via `DB_PASSWORD`)
- **Data Persistence**: Data is stored in a Docker volume `postgres_data`

### Backend API
- **Container**: `cscs_poc_backend`
- **Port**: 3000
- **Environment**: Development mode with hot reload
- **Dependencies**: Waits for PostgreSQL and database initialization

### Database Initialization
- **Container**: `cscs_poc_db_init`
- **Purpose**: 
  - Creates database if it doesn't exist
  - Runs Prisma migrations
  - Seeds the database with initial data
- **Runs**: Once on startup, before backend starts

### Frontend
- **Container**: `cscs_poc_frontend`
- **Port**: 5173
- **Environment**: Development mode with hot reload
- **Dependencies**: Waits for backend to be ready

## Docker Compose Commands

### Start Services
```bash
# Start all services in detached mode
docker-compose up -d

# Start specific service
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f db_init
```

### Execute Commands
```bash
# Run command in backend container
docker-compose exec backend npm run prisma:studio

# Run command in frontend container
docker-compose exec frontend npm run build

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d cscs_poc
```

## Database Management

### Reset Database
```bash
# Stop services and remove volumes
docker-compose down -v

# Start services (will recreate database and run migrations/seed)
docker-compose up -d
```

### Run Migrations Manually
```bash
docker-compose exec backend npx prisma migrate dev
```

### Seed Database Manually
```bash
docker-compose exec backend npm run prisma:seed
```

### Access Prisma Studio
```bash
docker-compose exec backend npx prisma studio
```
Then open http://localhost:5555 in your browser (if port forwarding is configured)

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres cscs_poc > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres cscs_poc < backup.sql
```

## Development Workflow

### Hot Reload
Both frontend and backend support hot reload:
- **Backend**: Changes to `backend/src/**` files trigger automatic restart
- **Frontend**: Changes to `frontend/src/**` files trigger automatic rebuild

### Making Changes
1. Edit files in your local workspace
2. Changes are automatically reflected in containers (via volume mounts)
3. Check logs if something doesn't work: `docker-compose logs -f`

### Adding Dependencies
```bash
# Backend
docker-compose exec backend npm install <package-name>

# Frontend
docker-compose exec frontend npm install <package-name>
```

## Troubleshooting

### Database Connection Issues
1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps postgres
   ```
2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```
3. Verify environment variables in `.env` file

### Backend Not Starting
1. Check backend logs:
   ```bash
   docker-compose logs backend
   ```
2. Verify database initialization completed:
   ```bash
   docker-compose logs db_init
   ```
3. Check if backend can connect to database:
   ```bash
   docker-compose exec backend nc -zv postgres 5432
   ```

### Frontend Not Connecting to Backend
1. Verify `VITE_API_URL` in `.env` matches backend URL
2. Check CORS settings in backend
3. Check network connectivity:
   ```bash
   docker-compose exec frontend ping backend
   ```

### Port Already in Use
If ports 3000, 5173, or 5432 are already in use:
1. Stop the conflicting service, or
2. Change ports in `.env` and `docker-compose.yml`

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## Production Build

For production deployment, use the production Dockerfiles:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

Note: Production compose file should be created separately with:
- Production Dockerfiles (without `-dev` suffix)
- Environment-specific configurations
- Nginx reverse proxy
- SSL/TLS certificates
- Resource limits
- Health checks

## Environment Variables

### Required Variables
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT token signing (min 32 characters)

### Optional Variables
- `DB_PORT`: PostgreSQL host port (default: 5433, container uses 5432 internally)
- `JWT_EXPIRES_IN`: JWT token expiration (default: 7d)
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:5173)
- `VITE_API_URL`: Frontend API URL (default: http://localhost:3000/api)

## Network

All services are connected via a Docker bridge network `cscs_network`, allowing them to communicate using service names:
- `postgres` - Database hostname
- `backend` - Backend API hostname
- `frontend` - Frontend hostname

## Volumes

- `postgres_data`: Persistent storage for PostgreSQL data
- `./backend:/app`: Backend source code (development)
- `./frontend:/app`: Frontend source code (development)

## Health Checks

- **PostgreSQL**: Checks if database is ready to accept connections
- **Backend**: Health endpoint at `/health`
- **Frontend**: Served by Vite dev server

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check Docker and Docker Compose versions
4. Review this documentation

