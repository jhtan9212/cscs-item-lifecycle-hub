# Docker Troubleshooting Guide

## Common Issues and Solutions

### Issue: db_init container exits with code 1

**Symptoms:**
```
service "db_init" didn't complete successfully: exit 1
```

**Possible Causes and Solutions:**

1. **Database connection issue**
   ```bash
   # Check db_init logs
   docker-compose logs db_init
   
   # Verify PostgreSQL is healthy
   docker-compose ps postgres
   ```

2. **Prisma migration issues**
   ```bash
   # Check if migrations exist
   ls -la backend/prisma/migrations/
   
   # If migrations don't exist, you may need to create them first
   docker-compose exec backend npx prisma migrate dev --name init
   ```

3. **OpenSSL/Prisma binary issues**
   - Ensure the Dockerfile includes OpenSSL packages
   - Rebuild the image: `docker-compose build --no-cache db_init`

4. **Database already exists with different schema**
   ```bash
   # Reset database (⚠️ deletes all data)
   docker-compose down -v
   docker-compose up -d
   ```

**Debug Steps:**
```bash
# 1. Check detailed logs
docker-compose logs db_init

# 2. Run db_init manually to see errors
docker-compose run --rm db_init sh

# 3. Test database connection
docker-compose exec postgres psql -U postgres -d postgres -c "\l"

# 4. Check if database exists
docker-compose exec postgres psql -U postgres -d postgres -c "SELECT datname FROM pg_database;"
```

### Issue: Backend container crashes

**Symptoms:**
- Backend keeps restarting
- TypeScript compilation errors

**Solutions:**

1. **TypeScript errors**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Fix TypeScript errors in the code
   # The container will auto-restart with nodemon
   ```

2. **Missing dependencies**
   ```bash
   # Rebuild backend
   docker-compose build --no-cache backend
   docker-compose up -d backend
   ```

3. **Database connection issues**
   ```bash
   # Verify DATABASE_URL is correct
   docker-compose exec backend env | grep DATABASE_URL
   
   # Test connection
   docker-compose exec backend npx prisma db pull
   ```

### Issue: Port already in use

**Symptoms:**
```
Error: bind: address already in use
```

**Solutions:**

1. **Find what's using the port**
   ```bash
   # For port 3000
   sudo lsof -i :3000
   # OR
   sudo netstat -tulpn | grep :3000
   ```

2. **Change port in docker-compose.yml**
   ```yaml
   ports:
     - "3001:3000"  # Change host port
   ```

3. **Stop conflicting service**
   ```bash
   # Stop the service using the port
   sudo systemctl stop <service-name>
   ```

### Issue: Permission denied (Docker socket)

**Symptoms:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply changes (choose one)
newgrp docker
# OR log out and back in
```

### Issue: Prisma OpenSSL warnings

**Symptoms:**
```
prisma:warn Prisma failed to detect the libssl/openssl version
```

**Solution:**
- This is usually just a warning and doesn't prevent Prisma from working
- If it causes issues, ensure Dockerfile includes:
  ```dockerfile
  RUN apk add --no-cache openssl openssl-dev libc6-compat
  ```

### Issue: Database migrations fail

**Symptoms:**
```
Error: Could not parse schema engine response
```

**Solutions:**

1. **Rebuild with OpenSSL**
   ```bash
   docker-compose build --no-cache db_init backend
   ```

2. **Check migration files exist**
   ```bash
   ls -la backend/prisma/migrations/
   ```

3. **Reset and recreate migrations**
   ```bash
   # ⚠️ This deletes all data
   docker-compose down -v
   docker-compose up -d postgres
   docker-compose exec backend npx prisma migrate dev
   ```

### Issue: Frontend can't connect to backend

**Symptoms:**
- Frontend shows connection errors
- API calls fail

**Solutions:**

1. **Check VITE_API_URL**
   ```bash
   # In docker-compose.yml, should be:
   VITE_API_URL: http://localhost:3000/api
   ```

2. **Verify backend is running**
   ```bash
   docker-compose ps backend
   curl http://localhost:3000/health
   ```

3. **Check CORS settings**
   - Backend CORS_ORIGIN should include frontend URL
   - Default: `http://localhost:5173`

### Issue: Services start but don't work

**Debug Checklist:**

1. **Check all services are running**
   ```bash
   docker-compose ps
   # All should show "Up" status
   ```

2. **Check service logs**
   ```bash
   docker-compose logs postgres
   docker-compose logs db_init
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. **Verify network connectivity**
   ```bash
   # Test backend can reach postgres
   docker-compose exec backend ping postgres
   
   # Test frontend can reach backend
   docker-compose exec frontend ping backend
   ```

4. **Check environment variables**
   ```bash
   docker-compose exec backend env | grep -E "(DATABASE|JWT|CORS)"
   docker-compose exec frontend env | grep VITE
   ```

### Quick Reset

If nothing works, reset everything:

```bash
# Stop and remove everything
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Getting Help

1. **Collect information:**
   ```bash
   # Service status
   docker-compose ps -a > status.txt
   
   # All logs
   docker-compose logs > logs.txt
   
   # Environment
   docker-compose config > config.txt
   ```

2. **Check specific service:**
   ```bash
   docker-compose logs <service-name>
   ```

3. **Run commands in container:**
   ```bash
   docker-compose exec <service-name> <command>
   # Example:
   docker-compose exec backend npx prisma studio
   docker-compose exec backend npm run prisma:seed
   ```

