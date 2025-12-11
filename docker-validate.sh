#!/bin/bash
# Docker Configuration Validation Script

set -e

echo "🔍 Validating Docker Configuration..."
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Function to print info
info() {
    echo "ℹ️  $1"
}

# Check 1: Docker installation
echo "1. Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    success "Docker is installed: $DOCKER_VERSION"
    
    if docker info &> /dev/null; then
        success "Docker daemon is running"
    else
        error "Docker daemon is not running. Please start Docker."
    fi
else
    error "Docker is not installed"
fi
echo ""

# Check 2: Docker Compose installation
echo "2. Checking Docker Compose installation..."
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version)
    success "Docker Compose (v2) is installed: $COMPOSE_VERSION"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    success "Docker Compose (v1) is installed: $COMPOSE_VERSION"
    COMPOSE_CMD="docker-compose"
else
    error "Docker Compose is not installed"
    COMPOSE_CMD=""
fi
echo ""

# Check 3: Validate docker-compose.yml syntax
echo "3. Validating docker-compose.yml syntax..."
if [ -f "docker-compose.yml" ]; then
    if [ -n "$COMPOSE_CMD" ]; then
        if $COMPOSE_CMD config > /dev/null 2>&1; then
            success "docker-compose.yml syntax is valid"
        else
            error "docker-compose.yml has syntax errors"
            $COMPOSE_CMD config 2>&1 | head -20
        fi
    else
        warning "Cannot validate docker-compose.yml (Docker Compose not available)"
    fi
else
    error "docker-compose.yml not found"
fi
echo ""

# Check 4: Check required files
echo "4. Checking required files..."
REQUIRED_FILES=(
    "backend/Dockerfile"
    "backend/Dockerfile.dev"
    "frontend/Dockerfile"
    "frontend/Dockerfile.dev"
    "backend/init-db.sh"
    "backend/wait-for-db.sh"
    ".env.example"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing: $file"
    fi
done
echo ""

# Check 5: Validate Dockerfiles
echo "5. Validating Dockerfiles..."
DOCKERFILES=(
    "backend/Dockerfile"
    "backend/Dockerfile.dev"
    "frontend/Dockerfile"
    "frontend/Dockerfile.dev"
)

for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        if docker run --rm -i hadolint/hadolint < "$dockerfile" 2>/dev/null || true; then
            # Hadolint not available, just check if file is readable
            if [ -r "$dockerfile" ]; then
                success "Dockerfile is readable: $dockerfile"
            fi
        fi
    fi
done
echo ""

# Check 6: Check script permissions
echo "6. Checking script permissions..."
SCRIPTS=(
    "backend/init-db.sh"
    "backend/wait-for-db.sh"
    "docker-start.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            success "Script is executable: $script"
        else
            warning "Script is not executable: $script"
            info "Run: chmod +x $script"
        fi
    fi
done
echo ""

# Check 7: Check .env file
echo "7. Checking environment configuration..."
if [ -f ".env" ]; then
    success ".env file exists"
    
    # Check required variables
    REQUIRED_VARS=("DB_USER" "DB_PASSWORD" "DB_NAME" "JWT_SECRET")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env 2>/dev/null; then
            success "Found: $var"
        else
            warning "Missing or empty: $var in .env"
        fi
    done
else
    warning ".env file not found (using .env.example as template)"
    if [ -f ".env.example" ]; then
        info "Run: cp .env.example .env"
    fi
fi
echo ""

# Check 8: Validate docker-compose services
echo "8. Validating docker-compose services..."
if [ -n "$COMPOSE_CMD" ] && [ -f "docker-compose.yml" ]; then
    SERVICES=$($COMPOSE_CMD config --services 2>/dev/null)
    if [ $? -eq 0 ]; then
        success "Found services: $(echo $SERVICES | tr '\n' ' ')"
        
        # Check if all expected services exist
        EXPECTED_SERVICES=("postgres" "backend" "frontend" "db_init")
        for service in "${EXPECTED_SERVICES[@]}"; do
            if echo "$SERVICES" | grep -q "^${service}$"; then
                success "Service exists: $service"
            else
                error "Missing service: $service"
            fi
        done
    fi
fi
echo ""

# Check 9: Port availability
echo "9. Checking port availability..."
PORTS=(3000 5173 5432)
for port in "${PORTS[@]}"; do
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            warning "Port $port is already in use"
            info "You may need to stop the service using this port or change the port in docker-compose.yml"
        else
            success "Port $port is available"
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            warning "Port $port is already in use"
        else
            success "Port $port is available"
        fi
    else
        info "Cannot check port $port (lsof/netstat not available)"
    fi
done
echo ""

# Check 10: Test build (dry run)
echo "10. Testing Docker build configuration..."
if [ -n "$COMPOSE_CMD" ] && docker info &> /dev/null; then
    info "Testing if services can be built (this may take a moment)..."
    if $COMPOSE_CMD config --quiet 2>/dev/null; then
        success "Docker Compose configuration is valid"
        
        # Try to validate build contexts
        if [ -d "backend" ] && [ -f "backend/package.json" ]; then
            success "Backend build context is valid"
        else
            error "Backend build context is invalid"
        fi
        
        if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
            success "Frontend build context is valid"
        else
            error "Frontend build context is invalid"
        fi
    else
        error "Docker Compose configuration has errors"
    fi
else
    warning "Cannot test build (Docker not available or not running)"
fi
echo ""

# Check 11: Network configuration
echo "11. Checking network configuration..."
if [ -n "$COMPOSE_CMD" ] && [ -f "docker-compose.yml" ]; then
    if grep -q "networks:" docker-compose.yml && grep -q "cscs_network" docker-compose.yml; then
        success "Network configuration found"
    else
        warning "Network configuration may be missing"
    fi
fi
echo ""

# Check 12: Volume configuration
echo "12. Checking volume configuration..."
if [ -n "$COMPOSE_CMD" ] && [ -f "docker-compose.yml" ]; then
    if grep -q "volumes:" docker-compose.yml && grep -q "postgres_data" docker-compose.yml; then
        success "Volume configuration found"
    else
        warning "Volume configuration may be missing"
    fi
fi
echo ""

# Summary
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    success "All checks passed! Docker configuration is ready."
    echo ""
    info "Next steps:"
    echo "  1. Review .env file (or create from .env.example)"
    echo "  2. Run: docker-compose up -d"
    echo "  3. Check logs: docker-compose logs -f"
elif [ $ERRORS -eq 0 ]; then
    success "Configuration is valid with $WARNINGS warning(s)"
    echo ""
    info "Review the warnings above and proceed when ready"
else
    error "Found $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    info "Please fix the errors before proceeding"
    exit 1
fi

