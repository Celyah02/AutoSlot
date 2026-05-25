# Database Design for XWZ LTD Car Parking Management System

## What You Need To Do

Yes, you will create the PostgreSQL database yourself.

The simplest approach for this phase is:

1. Install PostgreSQL if it is not already installed.
2. Create one database for the project, for example `xwz_parking_db`.
3. Run the SQL in `database/schema.sql`.

Later, when the microservices become more advanced, you can split data by service if needed.

## Suggested Database Name

`xwz_parking_db`

## Run These Commands

Create the database:

```powershell
psql -U postgres -c "CREATE DATABASE xwz_parking_db;"
```

Apply the schema:

```powershell
psql -U postgres -d xwz_parking_db -f database\schema.sql
```

## Tables and Relationships

### `users`

Stores system users such as admins and parking attendants.

- Primary key: `id`
- Unique field: `email`
- Constraint: `role` must be `admin` or `parking_attendant`

### `parking_locations`

Stores each parking area.

- Primary key: `code`
- Constraint: `available_spaces` cannot be less than `0`
- Constraint: `available_spaces` cannot be greater than `total_spaces`
- Constraint: `charging_fee_per_hour` cannot be negative

### `car_entries`

Stores each car entry record.

- Primary key: `id`
- Foreign key: `parking_code -> parking_locations(code)`
- Constraint: `exit_date_time` can be `NULL` at first
- Constraint: if present, `exit_date_time` must be after or equal to `entry_date_time`
- Constraint: `charged_amount` starts at `0` and cannot be negative

### `tickets`

Generated when a car enters.

- Primary key: `id`
- Foreign key: `entry_id -> car_entries(id)`
- `entry_id` is unique, so one car entry gets one ticket
- `ticket_number` is unique

### `billings`

Generated when a car exits.

- Primary key: `id`
- Foreign key: `entry_id -> car_entries(id)`
- Foreign key: `ticket_id -> tickets(id)`
- `entry_id` is unique, so one car entry gets one billing record
- `ticket_id` is unique, so one ticket maps to one billing record
- Stores both `duration_minutes` for auditability and `duration_hours` for billing calculations/reporting

## Relationship Summary

- One parking location can have many car entries.
- One car entry belongs to one parking location.
- One car entry has one ticket.
- One car entry has zero or one billing record.
- One ticket has zero or one billing record.

## Design Notes

- `available_spaces` is stored because the system needs fast availability checks.
- `charged_amount` is stored in `car_entries` for quick lookup after exit.
- `billings` stores the final duration in minutes and hours, plus the total amount as a historical billing snapshot.
- `ON DELETE RESTRICT` is used on core business tables to avoid accidental loss of important records.

## Simple Flow

1. A user or attendant manages the system.
2. A car enters a parking location.
3. A `car_entries` record is created.
4. A ticket is generated and linked to that car entry.
5. When the car exits, `exit_date_time` and `charged_amount` are updated.
6. A billing record is generated with duration and total amount.
