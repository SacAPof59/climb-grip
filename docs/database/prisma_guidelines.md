# Prisma Guidelines

## What is Prisma and why?

Prisma is a modern ORM (Object-Relational Mapping) for TypeScript that simplifies database interactions through a type-safe query builder.

### Key benefits:

- **Type safety**: Auto-generated TypeScript types based on your schema
- **Intuitive API**: Clean, readable query syntax
- **Productivity**: Reduces boilerplate code compared to traditional ORMs
- **Schema-driven**: Single source of truth for your database schema

In our project, Prisma helps us manage a complex database structure with interconnected models like Users, Climbers, Workouts, and Measurements while ensuring type safety across our application.

## Prisma Migration Commands for Local Development

### Create a migration

```bash
npx prisma migrate dev --name descriptive_name
```

Use when making changes to your schema (adding/modifying models, fields, or relationships). This command:

1. Generates SQL from your schema changes
2. Applies the migration to your development database
3. Regenerates the Prisma Client

### Apply migrations to production/staging

```bash
npx prisma migrate deploy
```

Use in CI/CD pipelines or when deploying to non-development environments.

### Reset your database (development only)

```bash
npx prisma migrate reset
```

Use during development to:

- Drop all tables in your database
- Apply all migrations from scratch
- Run seed scripts (if configured)

### Generate client without migrations

```bash
npx prisma generate
```

Use when you've pulled new migrations from the repository and need to update your client.

### View and edit your data

```bash
npx prisma studio
```

Use for quick data management and visualization during development.

### Development Workflow

1. Modify `schema.prisma` (add/change models or fields)
2. Run `npx prisma migrate dev --name descriptive_name`
3. Update your application code using the new schema
4. Commit both schema changes and migration files to version control

**Important**: Always commit both the schema changes and the generated migration files to ensure consistent database state across all environments.
