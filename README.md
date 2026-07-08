# GoDiscreet
Anonymous Dating & Matching Platform

Local development (quick start):

1. Install Docker Desktop and Node.js (>=18).
2. From backend/ run: `docker-compose up -d` to start Postgres, Redis, RabbitMQ and the API container.
3. Create a local .env by copying `backend/.env.example` and filling credentials (a `.env` has been added for local dev defaults).
4. Run migrations: `npm run db:migrate`
5. Run seed: `npm run db:seed`
6. Start the API (if not using the container): `npm run dev`

If Docker is not available, ensure Postgres (matching the .env settings) and Redis are running locally before running migrations.

