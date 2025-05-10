# Development

This documentation describes the requirements, setup and useful command to know when developing the application.

## Requirements

- [docker](https://docs.docker.com/engine/install/)
- [docker compose](https://docs.docker.com/compose/install/)

## Setup

- Set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables in [compose.yaml](../../compose.yaml) file following the [docs](https://next-auth.js.org/providers/google)
  - Run the following command

```(bash)
  docker compose up --detach
```

- The application should be running at: [localhost:3000/](localhost:3000/)

## Useful commands

| Action                                           | Command                                                |
| :----------------------------------------------- | :----------------------------------------------------- |
| Start the app                                    | `docker compose up --detach`                           |
| Run the migrations                               | `docker compose exec app npx prisma migrate dev`       |
| Watching logs                                    | `docker compose logs -f app`                           |
| Stopping all containers                          | `docker compose down --remove-orphans`                 |
| Run the linter                                   | `docker compose run --rm --no-deps app npm run lint`   |
| Run the formatter                                | `docker compose run --rm --no-deps app npm run format` |
| Clean database data _stop the containers before_ | `docker volume rm climb-grip_pgdata`                   |
