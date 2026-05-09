# Auth Service

This service handles user registration, login, JWT authentication, and role-based access control for the XWZ LTD car parking system.

## What It Does

- Registers public users as `parking_attendant`
- Authenticates users with email and password
- Hashes passwords with `bcryptjs`
- Generates JWT tokens after login
- Protects routes with JWT middleware
- Restricts admin-only routes with role middleware
- Validates incoming request data
- Returns structured error responses

## Environment Variables

```env
PORT=5001
SERVICE_NAME=auth-service
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/xwz_parking_db
```

## Install

```powershell
npm --prefix auth-service install
```

## Run

```powershell
npm --prefix auth-service run dev
```

## Endpoints

### Public

- `GET /api/auth/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected

- `GET /api/auth/verify`
- `GET /api/auth/me`
- `GET /api/auth/attendant/access`
- `GET /api/auth/admin/access`
- `POST /api/auth/admin/users`

## Request Bodies

### Register Parking Attendant

```json
{
  "firstName": "Alice",
  "lastName": "Mugisha",
  "email": "alice@example.com",
  "password": "StrongPass123"
}
```

### Login

```json
{
  "email": "alice@example.com",
  "password": "StrongPass123"
}
```

### Admin Creates User

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongPass123",
  "role": "admin"
}
```

## Notes

- Public registration creates only `parking_attendant` accounts.
- Admin creation is protected and requires a valid admin JWT.
- Role values are normalized to `admin` and `parking_attendant` before being stored in PostgreSQL.
