-- Introduce household records and associate every existing user with a household.
-- Existing users receive a personal household so the new relationship is non-null
-- without changing their current login or account ownership.

CREATE TABLE households (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

INSERT INTO households (name, created_at, updated_at)
SELECT
    LEFT(COALESCE(NULLIF(BTRIM(full_name), ''), 'Personal') || '''s Household', 100),
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM users
ORDER BY id;

ALTER TABLE users
    ADD COLUMN household_id BIGINT;

WITH household_assignments AS (
    SELECT
        u.id AS user_id,
        h.id AS household_id,
        ROW_NUMBER() OVER (ORDER BY u.id) AS row_num
    FROM users u
    JOIN households h
      ON h.name = LEFT(COALESCE(NULLIF(BTRIM(u.full_name), ''), 'Personal') || '''s Household', 100)
)
UPDATE users u
SET household_id = assignments.household_id
FROM household_assignments assignments
WHERE u.id = assignments.user_id
  AND assignments.row_num = (
      SELECT COUNT(*)
      FROM users earlier_user
      WHERE earlier_user.id <= u.id
  );

ALTER TABLE users
    ALTER COLUMN household_id SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_users_household
    FOREIGN KEY (household_id) REFERENCES households(id);
