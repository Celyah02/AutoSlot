# API Gateway

This service is the single entry point for the XWZ LTD frontend.

## Responsibilities

- Receives frontend API requests
- Proxies requests to downstream services
- Enforces JWT authentication for protected routes
- Returns centralized gateway errors for invalid requests and upstream failures

## Proxied Services

- `Auth Service` via `/api/auth`
- `Parking Service` via `/api/parking`
- `Entry Service` via `/api/entry`
- `Billing Service` via `/api/billing`
- `Reporting Service` via `/api/reporting`

## Public And Protected Routes

Public routes allowed through the gateway without a JWT:

- `GET /api/health`
- `GET /api`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/health`
- `GET /api/parking/health`
- `GET /api/entry/health`
- `GET /api/billing/health`
- `GET /api/reporting/health`

All other proxied service routes require:

```http
Authorization: Bearer <jwt>
```

## Environment Variables

```env
PORT=5000
SERVICE_NAME=api-gateway
NODE_ENV=development
JWT_SECRET=replace-with-the-same-secret-used-by-auth-service
AUTH_SERVICE_URL=http://localhost:5001
PARKING_SERVICE_URL=http://localhost:5002
ENTRY_SERVICE_URL=http://localhost:5003
BILLING_SERVICE_URL=http://localhost:5004
REPORTING_SERVICE_URL=http://localhost:5005
```

## Run

```powershell
npm --prefix api-gateway run dev
```

## Notes

- The gateway forwards HTTP method, query string, headers, and JSON request bodies.
- Upstream timeout errors return `504`.
- Upstream connectivity failures return `502`.
- Invalid JSON bodies return a structured `400` response.
