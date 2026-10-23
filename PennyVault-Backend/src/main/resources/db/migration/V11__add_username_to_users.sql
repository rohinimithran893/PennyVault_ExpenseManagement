-- Add username support while preserving compatibility with existing users.
-- Backfill existing rows before making the column mandatory.
-- Generated legacy usernames are deterministic and unique because each includes the user ID.

ALTER TABLE users
    ADD COLUMN username VARCHAR(50);

UPDATE users
SET username =
    LEFT(
        COALESCE(
            NULLIF(
                regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9]', '', 'g'),
                ''
            ),
            'user'
        ),
        25
    ) || '_' || id::text;

ALTER TABLE users
    ALTER COLUMN username SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT uq_users_username UNIQUE (username);
