-- Registration must create a user before creating a household because
-- households.owner_user_id references users.id. Allow the new user's household
-- association to be assigned immediately after the household is created.
-- Existing users were backfilled by V12 and remain associated.

ALTER TABLE users
    ALTER COLUMN household_id DROP NOT NULL;
