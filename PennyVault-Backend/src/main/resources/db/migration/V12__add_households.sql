-- Introduce household records and associate every existing user with a household.
-- Existing users receive a personal household so the new relationship is non-null
-- without changing their current login or account ownership.

CREATE TABLE households (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

ALTER TABLE users
    ADD COLUMN household_id BIGINT;

-- Temporarily retain the originating user ID to make the backfill deterministic,
-- including when different users have the same full name.
ALTER TABLE households
    ADD COLUMN migration_user_id BIGINT UNIQUE;

INSERT INTO households (name, created_at, updated_at, migration_user_id)
SELECT
    LEFT(COALESCE(NULLIF(BTRIM(full_name), ''), 'Personal') || '''s Household', 100),
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP),
    id
FROM users
ORDER BY id;

UPDATE users u
SET household_id = h.id
FROM households h
WHERE h.migration_user_id = u.id;

ALTER TABLE users
    ALTER COLUMN household_id SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_users_household
    FOREIGN KEY (household_id) REFERENCES households(id);

ALTER TABLE households
    DROP COLUMN migration_user_id;
