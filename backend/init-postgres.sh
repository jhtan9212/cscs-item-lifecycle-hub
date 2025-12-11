#!/bin/bash
# Initialize PostgreSQL: Create user and database with proper permissions
# This script runs in /docker-entrypoint-initdb.d/ on first database initialization

set -e

echo "=========================================="
echo "PostgreSQL User and Database Initialization"
echo "=========================================="
echo "POSTGRES_USER: $POSTGRES_USER"
echo "POSTGRES_DB: $POSTGRES_DB"
echo ""

# Note: This script runs as postgres superuser during initdb
# The POSTGRES_USER and POSTGRES_PASSWORD are already set by the entrypoint

# If POSTGRES_USER is not 'postgres', create the user with all privileges
if [ "$POSTGRES_USER" != "postgres" ]; then
  echo "Creating user '$POSTGRES_USER'..."
  psql -v ON_ERROR_STOP=1 <<-EOSQL
    CREATE USER "$POSTGRES_USER" WITH PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER "$POSTGRES_USER" WITH CREATEDB SUPERUSER;
EOSQL
  echo "✅ User '$POSTGRES_USER' created with CREATEDB and SUPERUSER privileges"
else
  echo "Using default postgres user"
fi

# Database is already created by entrypoint, but ensure ownership
if [ "$POSTGRES_USER" != "postgres" ]; then
  echo "Setting database '$POSTGRES_DB' owner to '$POSTGRES_USER'..."
  psql -v ON_ERROR_STOP=1 <<-EOSQL
    ALTER DATABASE "$POSTGRES_DB" OWNER TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO "$POSTGRES_USER";
EOSQL
  echo "✅ Database ownership and privileges granted"
fi

# Grant privileges on public schema
echo "Granting privileges on public schema..."
psql -v ON_ERROR_STOP=1 -d "$POSTGRES_DB" <<-EOSQL
    GRANT ALL ON SCHEMA public TO "$POSTGRES_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$POSTGRES_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$POSTGRES_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "$POSTGRES_USER";
EOSQL
echo "✅ Schema privileges granted"

echo ""
echo "=========================================="
echo "✅ PostgreSQL initialization complete!"
echo "=========================================="
echo "User: $POSTGRES_USER"
echo "Database: $POSTGRES_DB"
echo ""

