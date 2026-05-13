# Parking Service

This service manages parking locations for the XWZ LTD car parking system.

## What It Does

- Allows only admins to create parking locations
- Lets authenticated admins and parking attendants view parking locations
- Returns available spaces and charging fee per hour
- Supports pagination when listing parking locations
- Validates incoming data before saving it
- Prevents negative available spaces through validation and database constraints

## Environment Variables

```env
PORT=5002
SERVICE_NAME=parking-service
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/xwz_parking_db
```

## Install

```powershell
npm --prefix parking-service install
```

## Run

```powershell
npm --prefix parking-service run dev
```

## Endpoints

- `GET /api/parking/health`
- `POST /api/parking`
- `GET /api/parking?page=1&limit=10`
- `GET /api/parking/:code`

## Notes

- The API field `numberOfAvailableSpaces` is stored in PostgreSQL as both `total_spaces` and `available_spaces` during initial creation.
- This matches the current database schema while keeping the request body aligned with your prompt.
