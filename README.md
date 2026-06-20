# Slooze — Food Ordering

A small food ordering app with role-based access and per-country data scoping.

Monorepo: **NestJS + GraphQL + Prisma** (backend) and **Next.js + Apollo + Tailwind** (frontend).

## Run it

```bash
npm install     # install backend + frontend
npm run setup   # create the SQLite db + seed data
npm run dev     # start both servers
```

- App → http://localhost:3000
- GraphQL → http://localhost:4000/graphql

That's it — no manual config; `setup` creates the `.env` files and seeds everything.

## Log in

Pick any seeded user on the login page (mock auth, no password):

| User | Role | Country |
|---|---|---|
| Nick Fury | Admin | all |
| Captain Marvel | Manager | India |
| Captain America | Manager | America |
| Thanos / Thor | Member | India |
| Travis | Member | America |

Members can browse and create orders; checkout/cancel is Manager/Admin; payment
methods are Admin only. Non-admins only see their own country's data — all
enforced on the backend.

## More

- Screenshots: [`docs/screenshots/`](docs/screenshots/)
- Tests: `npm run test --workspace backend`
