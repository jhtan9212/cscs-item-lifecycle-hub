# Docker Configuration Validation Guide

This guide provides multiple ways to validate your Docker configuration before running the services.

## Quick Validation

Run the automated validation script:

```bash
./docker-validate.sh
```

This script checks:
- ✅ Docker and Docker Compose installation
- ✅ docker-compose.yml syntax
- ✅ Required files existence
- ✅ Script permissions
- ✅ Environment configuration
- ✅ Port availability
- ✅ Service definitions
- ✅ Network and volume configuration

## Manual Validation Steps

### 1. Check Docker Installation

```bash
# Check Docker version
docker --version

# Check Docker daemon
docker info

# Check Docker Compose
docker compose version
# OR
docker-compose --version
```

### 2. Validate docker-compose.yml Syntax

```bash
# Validate syntax (doesn't start services)
docker compose config

# Validate and show the resolved configuration
docker compose config --quiet

# Check specific service configuration
docker compose config --services
```

**Expected output:**
```
postgres
backend
frontend
db_init
```

### 3. Check Required Files

```bash
# Check all required files exist
ls -la docker-compose.yml
ls -la backend/Dockerfile*
ls -la frontend/Dockerfile*
ls -la backend/*.sh
ls -la .env.example
```

### 4. Validate Dockerfiles

```bash
# Test backend Dockerfile syntax
docker build -f backend/Dockerfile.dev -t test-backend ./backend --dry-run 2>&1 || echo "Syntax check"

# Test frontend Dockerfile syntax
docker build -f frontend/Dockerfile.dev -t test-frontend ./frontend --dry-run 2>&1 || echo "Syntax check"
```

### 5. Check Script Permissions

```bash
# Ensure scripts are executable
chmod +x backend/init-db.sh
chmod +x backend/wait-for-db.sh
chmod +x docker-start.sh
chmod +x docker-validate.sh

# Verify permissions
ls -la backend/*.sh docker-*.sh
```

### 6. Validate Environment Configuration

```bash
# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file exists"
    # Check required variables
    grep -E "^(DB_USER|DB_PASSWORD|DB_NAME|JWT_SECRET)=" .env
else
    echo "⚠️  .env file not found"
    echo "Run: cp .env.example .env"
fi
```

### 7. Test Build (Without Starting)

```bash
# Build images without starting services
docker compose build --no-cache

# This will validate:
# - Dockerfile syntax
# - Build context
# - Dependencies
# - File structure
```

### 8. Validate Service Dependencies

```bash
# Check service dependencies
docker compose config | grep -A 5 "depends_on"

# Expected output should show:
# - postgres has no dependencies
# - db_init depends on postgres (health check)
# - backend depends on postgres and db_init
# - frontend depends on backend
```

### 9. Check Port Availability

```bash
# Check if ports are available
for port in 3000 5173 5432; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is in use"
    else
        echo "✅ Port $port is available"
    fi
done
```

### 10. Validate Network Configuration

```bash
# Check network is defined
docker compose config | grep -A 3 "networks:"

# Should show cscs_network
```

### 11. Validate Volume Configuration

```bash
# Check volumes are defined
docker compose config | grep -A 2 "volumes:"

# Should show postgres_data
```

## Dry Run Test

Test the entire configuration without starting services:

```bash
# Validate configuration
docker compose config > /dev/null && echo "✅ Configuration is valid"

# Check what would be created
docker compose config --services
docker compose config --volumes
docker compose config --networks
```

## Step-by-Step Validation Checklist

Use this checklist to manually verify everything:

- [ ] Docker is installed and running
- [ ] Docker Compose is installed
- [ ] `docker-compose.yml` syntax is valid (`docker compose config`)
- [ ] All Dockerfiles exist and are readable
- [ ] All shell scripts exist and are executable
- [ ] `.env` file exists (or `.env.example` is present)
- [ ] Required environment variables are set
- [ ] Ports 3000, 5173, 5432 are available
- [ ] Build contexts are valid (backend/ and frontend/ directories exist)
- [ ] Service dependencies are correct
- [ ] Network configuration is present
- [ ] Volume configuration is present

## Common Issues and Fixes

### Issue: "docker-compose.yml has syntax errors"

**Fix:**
```bash
# Check syntax
docker compose config

# Look for specific errors in the output
# Common issues:
# - Indentation errors (use spaces, not tabs)
# - Missing quotes around values with special characters
# - Incorrect service names or references
```

### Issue: "Script is not executable"

**Fix:**
```bash
chmod +x backend/init-db.sh
chmod +x backend/wait-for-db.sh
chmod +x docker-start.sh
chmod +x docker-validate.sh
```

### Issue: "Port already in use"

**Fix:**
```bash
# Find what's using the port
lsof -i :3000
# OR
netstat -tuln | grep :3000

# Stop the conflicting service or change port in docker-compose.yml
```

### Issue: "Cannot connect to Docker daemon"

**Fix:**
```bash
# Start Docker service
sudo systemctl start docker
# OR on macOS/Windows, start Docker Desktop
```

### Issue: "Build context invalid"

**Fix:**
```bash
# Ensure you're in the project root
cd /path/to/cscs_poc

# Verify directories exist
ls -la backend/ frontend/

# Check package.json files exist
ls -la backend/package.json frontend/package.json
```

## Validation Before First Run

Before running `docker-compose up` for the first time:

1. ✅ Run validation script: `./docker-validate.sh`
2. ✅ Create `.env` file: `cp .env.example .env`
3. ✅ Review and update `.env` if needed
4. ✅ Ensure Docker is running: `docker info`
5. ✅ Test build: `docker compose build`
6. ✅ Validate config: `docker compose config`

## Quick Validation Command

One-liner to check the most important things:

```bash
docker compose config > /dev/null && \
  [ -f .env ] && \
  [ -x backend/init-db.sh ] && \
  [ -x backend/wait-for-db.sh ] && \
  echo "✅ Configuration looks good!" || \
  echo "❌ Issues found - run ./docker-validate.sh for details"
```

## Next Steps After Validation

Once validation passes:

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

4. **Test endpoints:**
   ```bash
   curl http://localhost:3000/health
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

