CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role
        CHECK (role IN ('admin', 'parking_attendant'))
);

CREATE TABLE parking_locations (
    code VARCHAR(20) PRIMARY KEY,
    parking_name VARCHAR(150) NOT NULL,
    total_spaces INTEGER NOT NULL,
    available_spaces INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    charging_fee_per_hour NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_parking_total_spaces
        CHECK (total_spaces >= 0),
    CONSTRAINT chk_parking_available_spaces
        CHECK (available_spaces >= 0 AND available_spaces <= total_spaces),
    CONSTRAINT chk_parking_fee
        CHECK (charging_fee_per_hour >= 0)
);

CREATE TABLE car_entries (
    id BIGSERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    parking_code VARCHAR(20) NOT NULL,
    entry_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_date_time TIMESTAMP NULL,
    charged_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_car_entries_parking
        FOREIGN KEY (parking_code)
        REFERENCES parking_locations(code)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_car_entries_charged_amount
        CHECK (charged_amount >= 0),
    CONSTRAINT chk_car_entries_exit_after_entry
        CHECK (exit_date_time IS NULL OR exit_date_time >= entry_date_time)
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    entry_id BIGINT NOT NULL UNIQUE,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT fk_tickets_entry
        FOREIGN KEY (entry_id)
        REFERENCES car_entries(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_tickets_status
        CHECK (status IN ('active', 'closed'))
);

CREATE TABLE billings (
    id BIGSERIAL PRIMARY KEY,
    entry_id BIGINT NOT NULL UNIQUE,
    ticket_id BIGINT NOT NULL UNIQUE,
    duration_minutes INTEGER NOT NULL,
    duration_hours NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_billings_entry
        FOREIGN KEY (entry_id)
        REFERENCES car_entries(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_billings_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_billings_duration
        CHECK (duration_minutes >= 0),
    CONSTRAINT chk_billings_duration_hours
        CHECK (duration_hours >= 0),
    CONSTRAINT chk_billings_total_amount
        CHECK (total_amount >= 0),
    CONSTRAINT chk_billings_payment_status
        CHECK (payment_status IN ('pending', 'paid', 'cancelled'))
);

CREATE INDEX idx_car_entries_parking_code
    ON car_entries(parking_code);

CREATE INDEX idx_car_entries_plate_number
    ON car_entries(plate_number);

CREATE INDEX idx_car_entries_entry_date_time
    ON car_entries(entry_date_time);

CREATE INDEX idx_tickets_ticket_number
    ON tickets(ticket_number);

CREATE INDEX idx_billings_generated_at
    ON billings(generated_at);
