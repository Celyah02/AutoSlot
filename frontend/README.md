# Frontend

This folder contains the React frontend for the XWZ LTD parking system.

## Features

- Signup and login flows
- JWT session storage
- Protected routes
- Role-based navigation
- Admin dashboard and parking management
- Car entry and exit workflows
- Reporting with filters and pagination
- Responsive modern UI connected to the API Gateway

## Environment

Create a `.env` file from the example:

```powershell
Copy-Item frontend\\.env.example frontend\\.env
```

Default value:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Install

```powershell
npm --prefix frontend install
```

## Run

```powershell
npm --prefix frontend run dev
```

## Build

```powershell
npm --prefix frontend run build
```
