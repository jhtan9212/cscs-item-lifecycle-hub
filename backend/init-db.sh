#!/bin/sh
# Initialize database: create if not exists, run migrations, and seed

set -e

echo "=========================================="
echo "Database Initialization Script"
echo "=========================================="
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_USER: $DB_USER"
echo "DB_NAME: $DB_NAME"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
echo ""

echo "Waiting for PostgreSQL to be ready..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "✅ PostgreSQL is up - proceeding with database initialization"
echo ""

# Create database if it doesn't exist
# First try with DB_USER, if that fails (user doesn't exist), use postgres
echo "Creating database if it doesn't exist..."
DB_EXISTS=$(PGPASSWORD=postgres psql -h "$DB_HOST" -U postgres -p "$DB_PORT" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | xargs)

if [ "$DB_EXISTS" = "1" ]; then
  echo "✅ Database '$DB_NAME' already exists"
else
  echo "Creating database '$DB_NAME'..."
  # Try with postgres user first (always exists)
  PGPASSWORD=postgres psql -h "$DB_HOST" -U postgres -p "$DB_PORT" -d postgres -c "CREATE DATABASE $DB_NAME" || {
    echo "❌ Failed to create database"
    exit 1
  }
  echo "✅ Database '$DB_NAME' created successfully"
fi

# Ensure database ownership is correct
if [ "$DB_USER" != "postgres" ]; then
  echo "Setting database owner to '$DB_USER'..."
  PGPASSWORD=postgres psql -h "$DB_HOST" -U postgres -p "$DB_PORT" -d postgres -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" || echo "⚠️  Could not change owner (user might not exist yet)"
fi

echo ""
echo "Database ready"
echo ""

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate || {
  echo "❌ Failed to generate Prisma Client"
  exit 1
}
echo "✅ Prisma Client generated"

echo ""

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "❌ Failed to run migrations"
  echo "Attempting to initialize migrations..."
  npx prisma migrate dev --name init --create-only || {
    echo "❌ Failed to initialize migrations"
    exit 1
  }
  npx prisma migrate deploy || {
    echo "❌ Failed to deploy migrations after initialization"
    exit 1
  }
}
echo "✅ Migrations deployed successfully"

echo ""

# Seed database
echo "Seeding database..."
npm run prisma:seed || {
  echo "⚠️  Database seeding failed (this may be expected if already seeded)"
  echo "Continuing anyway..."
}

echo ""
echo "=========================================="
echo "✅ Database initialization complete!"
echo "=========================================="

