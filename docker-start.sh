#!/bin/bash
# Quick start script for Docker development environment

set -e

echo "🚀 Starting Item Lifecycle Hub Platform with Docker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please review and update .env file with your configuration"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Use docker compose (v2) if available, otherwise docker-compose (v1)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Building Docker images..."
$COMPOSE_CMD build

echo "🔧 Starting services..."
$COMPOSE_CMD up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

echo "📊 Service status:"
$COMPOSE_CMD ps

echo ""
echo "✅ Services are starting up!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   Health:    http://localhost:3000/health"
echo "   Database:  localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   Database studio:  docker-compose exec backend npx prisma studio"
echo ""
echo "🔍 Checking service health..."
sleep 3

# Check backend health
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⏳ Backend is still starting up..."
fi

echo ""
echo "🎉 Setup complete! Check the logs with: docker-compose logs -f"

