ALTER TABLE billings
ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(10, 2);

UPDATE billings
SET duration_hours = ROUND((duration_minutes::NUMERIC / 60), 2)
WHERE duration_hours IS NULL;

ALTER TABLE billings
ALTER COLUMN duration_hours SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_billings_duration_hours'
    ) THEN
        ALTER TABLE billings
        ADD CONSTRAINT chk_billings_duration_hours
            CHECK (duration_hours >= 0);
    END IF;
END $$;
