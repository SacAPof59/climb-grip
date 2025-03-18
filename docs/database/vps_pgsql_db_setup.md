# Setting Up PostgreSQL on Your VPS

Let's implement PostgreSQL on your VPS and create a new schema with a dedicated user. Here's a step-by-step guide:

## 1. Install PostgreSQL

First, connect to your VPS via SSH and install PostgreSQL:

```bash
# Update your package list
sudo apt update

# Install PostgreSQL and its contrib package
sudo apt install postgresql postgresql-contrib
```

## 2. Verify the Installation

Check that PostgreSQL is running:

```bash
sudo systemctl status postgresql
```

## 3. Access PostgreSQL

Switch to the postgres user to access the PostgreSQL command line:

```bash
sudo -i -u postgres
psql
```

## 4. Create a New User

Create a dedicated user for your Next.js application:

```sql
CREATE USER nextapp WITH PASSWORD 'your_secure_password';
```

Be sure to replace 'your_secure_password' with a strong password.

## 5. Create a Database

```sql
CREATE DATABASE nextapp_db;
```

## 6. Create a Custom Schema

Now, let's create your custom schema (not the default public schema):

```sql
\c nextapp_db
CREATE SCHEMA nextapp_schema;
```

## 7. Grant Permissions

Grant the necessary permissions to your user:

```sql
GRANT ALL PRIVILEGES ON DATABASE nextapp_db TO nextapp;
GRANT ALL PRIVILEGES ON SCHEMA nextapp_schema TO nextapp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA nextapp_schema TO nextapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA nextapp_schema TO nextapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA nextapp_schema GRANT ALL PRIVILEGES ON TABLES TO nextapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA nextapp_schema GRANT ALL PRIVILEGES ON SEQUENCES TO nextapp;
```

## 8. Set Default Schema for the User

```sql
ALTER ROLE nextapp SET search_path TO nextapp_schema;
```

## 9. Configure PostgreSQL for Remote Access (if needed)

Edit the PostgreSQL configuration files to allow connections from your application:

```bash
# Exit the psql prompt
\q

# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Change the listen_addresses line to:

```
listen_addresses = '*'
```

Then edit the client authentication configuration:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add this line to allow connections from your application:

```
host    nextapp_db    nextapp    0.0.0.0/0    md5
```

## 10. Restart PostgreSQL to Apply Changes

```bash
sudo systemctl restart postgresql
```

## 11. Test the Connection

Test that your new user can connect to the database:

```bash
psql -h localhost -U nextapp -d nextapp_db
```

When prompted, enter the password you created earlier.

Now your PostgreSQL database is set up with a custom schema and a dedicated user with the appropriate permissions. You're ready to integrate this with Prisma in your Next.js application!
