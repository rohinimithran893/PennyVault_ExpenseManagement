-- Extend the existing households table rather than recreating it.
-- The current schema already stores household ownership in owner_user_id.
-- Preserve existing rows and assign each existing user a household association.

ALTER TABLE households
    ADD COLUMN name VARCHAR(100);

ALTER TABLE households
    ADD COLUMN updated_at TIMESTAMP;

UPDATE households h
SET name = LEFT(
    COALESCE(NULLIF(BTRIM(u.full_name), ''), 'Personal') || '''s Household',
    100
),
updated_at = COALESCE(h.updated_at, h.created_at, CURRENT_TIMESTAMP)
FROM users u
WHERE u.id = h.owner_user_id
  AND h.name IS NULL;

-- Keep any household rows whose owner no longer has a matching user usable.
UPDATE households
SET name = 'Household ' || id::text
WHERE name IS NULL;

ALTER TABLE households
    ALTER COLUMN name SET NOT NULL;

ALTER TABLE users
    ADD COLUMN household_id BIGINT;

-- Create a household for each user who does not already own one.
INSERT INTO households (owner_user_id, created_at, name, updated_at)
SELECT
    u.id,
    COALESCE(u.created_at, CURRENT_TIMESTAMP),
    LEFT(COALESCE(NULLIF(BTRIM(u.full_name), ''), 'Personal') || '''s Household', 100),
    COALESCE(u.updated_at, CURRENT_TIMESTAMP)
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM households h
    WHERE h.owner_user_id = u.id
);

-- Associate each user with their owned household. MIN makes the choice
-- deterministic if historical data contains more than one household per owner.
UPDATE users u
SET household_id = owned_household.id
FROM (
    SELECT owner_user_id, MIN(id) AS id
    FROM households
    GROUP BY owner_user_id
) owned_household
WHERE owned_household.owner_user_id = u.id;

ALTER TABLE users
    ALTER COLUMN household_id SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_users_household
    FOREIGN KEY (household_id) REFERENCES households(id);
