# Setting Up PostgreSQL for Local Development

This guide will help you set up a local PostgreSQL database for development purposes.

## 1. Install PostgreSQL

### On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### On macOS (using Homebrew):

```bash
brew install postgresql
brew services start postgresql
```

### On Windows:

Download and run the installer from the [PostgreSQL website](https://www.postgresql.org/download/windows/).

## 2. Access PostgreSQL

```bash
# For Linux/macOS (Switch to postgres user)
sudo -i -u postgres
psql

# For Windows (Using psql from command prompt)
psql -U postgres
```

## 3. Create a Database User

```sql
CREATE USER nextapp WITH PASSWORD 'nextapp';
```

## 4. Create a Database

```sql
CREATE DATABASE nextapp_db;
```

## 5. Create Schema and Set Permissions

```sql
\c nextapp_db
CREATE SCHEMA nextapp_schema;

GRANT ALL PRIVILEGES ON DATABASE nextapp_db TO nextapp;
GRANT ALL PRIVILEGES ON SCHEMA nextapp_schema TO nextapp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA nextapp_schema TO nextapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA nextapp_schema TO nextapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA nextapp_schema GRANT ALL PRIVILEGES ON TABLES TO nextapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA nextapp_schema GRANT ALL PRIVILEGES ON SEQUENCES TO nextapp;
```

## 6. Set Default Schema for the User

```sql
ALTER ROLE nextapp SET search_path TO nextapp_schema;
```

## 7. Test the Connection

Exit the psql prompt with `\q` and test your new user:

```bash
psql -h localhost -U nextapp -d nextapp_db
```

When prompted, enter the password `nextapp`.

## 8. Configure Your Environment

Verify your `.env` file contains the correct database connection string:

```
DATABASE_URL="postgresql://nextapp:nextapp@localhost:5432/nextapp_db?schema=nextapp_schema"
```

## 9. Apply Prisma Migrations

After setting up your local database:

```bash
# Apply migrations to create all tables
npx prisma migrate dev
```

## 10. View Your Database (Optional)

Launch Prisma Studio to view and edit your data:

```bash
npx prisma studio
```

Now your local PostgreSQL database is ready for development with the same structure as your production environment.
