-- Restore missing owner membership records for existing households.
-- Preserve existing memberships and avoid duplicate household/user pairs.

INSERT INTO household_members (
    household_id,
    user_id,
    member_role,
    is_active,
    joined_at
)
SELECT
    h.id,
    h.owner_user_id,
    'OWNER',
    TRUE,
    COALESCE(h.created_at, CURRENT_TIMESTAMP)
FROM households h
WHERE NOT EXISTS (
    SELECT 1
    FROM household_members hm
    WHERE hm.household_id = h.id
      AND hm.user_id = h.owner_user_id
)
ON CONFLICT (household_id, user_id) DO NOTHING;