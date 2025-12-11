#!/bin/sh
# Create PostgreSQL user and grant permissions (for existing databases)

set -e

DB_USER="${DB_USER:-$POSTGRES_USER}"
DB_PASSWORD="${DB_PASSWORD:-$POSTGRES_PASSWORD}"
DB_NAME="${DB_NAME:-$POSTGRES_DB}"

if [ -z "$DB_USER" ] || [ "$DB_USER" = "postgres" ]; then
  echo "Using default postgres user or DB_USER not set"
  exit 0
fi

echo "=========================================="
echo "Creating PostgreSQL User: $DB_USER"
echo "=========================================="

# Wait for PostgreSQL
echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Wait a bit more for PostgreSQL to fully start
sleep 2

# Test connection
until PGPASSWORD=postgres psql -h postgres -U postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL not accepting connections yet..."
  sleep 1
done

echo "✅ PostgreSQL is ready"
echo ""

# Create user if it doesn't exist
echo "Creating user '$DB_USER'..."
PGPASSWORD=postgres psql -h postgres -U postgres <<-EOSQL || echo "User might already exist"
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
      CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';
      ALTER USER "$DB_USER" WITH CREATEDB SUPERUSER;
      RAISE NOTICE 'User $DB_USER created';
    ELSE
      RAISE NOTICE 'User $DB_USER already exists';
      ALTER USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';
      ALTER USER "$DB_USER" WITH CREATEDB SUPERUSER;
    END IF;
  END
  \$\$;
EOSQL

# Create database if it doesn't exist
echo "Creating database '$DB_NAME'..."
PGPASSWORD=postgres psql -h postgres -U postgres <<-EOSQL || echo "Database might already exist"
  SELECT 'CREATE DATABASE "$DB_NAME" OWNER "$DB_USER"'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOSQL

# Grant privileges
echo "Granting privileges..."
PGPASSWORD=postgres psql -h postgres -U postgres <<-EOSQL
  ALTER DATABASE "$DB_NAME" OWNER TO "$DB_USER";
  GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
EOSQL

# Grant schema privileges
echo "Granting schema privileges..."
PGPASSWORD="$DB_PASSWORD" psql -h postgres -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
  GRANT ALL ON SCHEMA public TO "$DB_USER";
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "$DB_USER";
EOSQL

echo ""
echo "=========================================="
echo "✅ User and database setup complete!"
echo "=========================================="

