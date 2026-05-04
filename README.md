# XWZ Car Parking Management System

This repository now contains a starter microservices structure for the XWZ LTD Car Parking Management System.

Business logic has intentionally not been implemented yet. Each service is an independent Express application with its own entry point, route file, package manifest, and environment template.

## Services

- `api-gateway`
- `auth-service`
- `parking-service`
- `entry-service`
- `billing-service`
- `reporting-service`

## Project Structure

```text
xwz-car-parking-system/
|-- api-gateway/
|-- auth-service/
|-- parking-service/
|-- entry-service/
|-- billing-service/
|-- reporting-service/
|-- package.json
`-- README.md
```

## Environment Configuration

Each service includes a `.env.example` file.

Create a real `.env` file in each service folder by copying the example:

```powershell
Copy-Item api-gateway\.env.example api-gateway\.env
Copy-Item auth-service\.env.example auth-service\.env
Copy-Item parking-service\.env.example parking-service\.env
Copy-Item entry-service\.env.example entry-service\.env
Copy-Item billing-service\.env.example billing-service\.env
Copy-Item reporting-service\.env.example reporting-service\.env
```

## Install Dependencies

Install dependencies for each service:

```powershell
npm --prefix api-gateway install
npm --prefix auth-service install
npm --prefix parking-service install
npm --prefix entry-service install
npm --prefix billing-service install
npm --prefix reporting-service install
```

If you want to run all services from the repository root with one command, also install the root dependency:

```powershell
npm install
```

## Run All Services

### Option 1: Run each service separately

Open a separate terminal for each service and run:

```powershell
npm --prefix api-gateway run dev
npm --prefix auth-service run dev
npm --prefix parking-service run dev
npm --prefix entry-service run dev
npm --prefix billing-service run dev
npm --prefix reporting-service run dev
```

### Option 2: Run all services from the root

```powershell
npm run dev
```

## Default Ports

- API Gateway: `5000`
- Auth Service: `5001`
- Parking Service: `5002`
- Entry Service: `5003`
- Billing Service: `5004`
- Reporting Service: `5005`

## Available Starter Endpoints

These endpoints are placeholders only.

- `GET /api/health` on the API Gateway
- `GET /api/auth/health`
- `GET /api/parking/health`
- `GET /api/entry/health`
- `GET /api/billing/health`
- `GET /api/reporting/health`

Additional placeholder routes exist for future booking, entry, billing, and reporting logic.

## From-Scratch Scaffold Commands

If you want to recreate this folder structure yourself from a blank repository, use:

```powershell
mkdir api-gateway, auth-service, parking-service, entry-service, billing-service, reporting-service
mkdir api-gateway\src\routes, auth-service\src\routes, parking-service\src\routes, entry-service\src\routes, billing-service\src\routes, reporting-service\src\routes
npm init -y
npm --prefix api-gateway init -y
npm --prefix auth-service init -y
npm --prefix parking-service init -y
npm --prefix entry-service init -y
npm --prefix billing-service init -y
npm --prefix reporting-service init -y
npm --prefix api-gateway install express cors dotenv
npm --prefix auth-service install express cors dotenv jsonwebtoken
npm --prefix parking-service install express cors dotenv
npm --prefix entry-service install express cors dotenv
npm --prefix billing-service install express cors dotenv
npm --prefix reporting-service install express cors dotenv
npm --prefix api-gateway install -D nodemon
npm --prefix auth-service install -D nodemon
npm --prefix parking-service install -D nodemon
npm --prefix entry-service install -D nodemon
npm --prefix billing-service install -D nodemon
npm --prefix reporting-service install -D nodemon
npm install -D concurrently
```
