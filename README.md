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

Deployment to Render (recommended):

1. Create a new Web Service on Render and connect it to this GitHub repository, or note the service ID.
2. In the repository settings -> Secrets, add:
   - RENDER_API_KEY: your Render API key
   - RENDER_SERVICE_ID: the service id for your Web Service
3. Push to main — the workflow `.github/workflows/deploy-render.yml` will trigger and call the Render API to create a new deploy.

If you prefer another platform (Heroku, DigitalOcean), tell me and I will add deployment config for it.


