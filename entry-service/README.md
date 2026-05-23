# Entry Service

This service manages vehicle entry and exit for the XWZ LTD car parking system.

## What It Does

- Registers car entry with auto-generated entry time
- Generates a ticket on entry
- Decreases available parking spaces on entry
- Registers car exit with exit time and charged amount
- Increases available parking spaces on exit
- Attempts to trigger bill generation through the billing service
- Prevents entry when parking is full
- Prevents exit when no matching entry exists
- Logs requests and key actions
- Validates input and returns structured errors

## Environment Variables

```env
PORT=5003
SERVICE_NAME=entry-service
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/xwz_parking_db
BILLING_SERVICE_URL=http://localhost:5004
```

## Install

```powershell
npm --prefix entry-service install
```

## Run

```powershell
npm --prefix entry-service run dev
```

## Endpoints

- `GET /api/entry/health`
- `POST /api/entry/entries`
- `POST /api/entry/exits`
- `GET /api/entry/durations/:id`

## Request Bodies

### Register Entry

```json
{
  "plateNumber": "RAB123A",
  "parkingCode": "KGL001"
}
```

### Register Exit

```json
{
  "ticketNumber": "TKT-KGL001-1-1715292000000"
}
```

## Notes

- `entryDateTime` is generated automatically by PostgreSQL.
- `exitDateTime` starts as `NULL`.
- `chargedAmount` starts at `0` and is updated during exit.
- Billing service handoff is prepared through `POST /api/billing/generate`. Full billing persistence will be finalized when the billing service is implemented.
