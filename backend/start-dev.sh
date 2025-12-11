#!/bin/sh
# Backend development startup script

set -e

echo "=========================================="
echo "Starting Backend Development Server"
echo "=========================================="

echo "Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "✅ PostgreSQL is ready"
echo ""

echo "Generating Prisma Client..."
npx prisma generate

echo "✅ Prisma Client generated"
echo ""

echo "Starting backend server..."
npm run dev

