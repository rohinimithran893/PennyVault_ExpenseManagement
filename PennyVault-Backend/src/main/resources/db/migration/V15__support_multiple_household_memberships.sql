-- Separate household membership from the user's personal/default household.
-- Preserve existing associations and include each household's owner as a member.
CREATE TABLE household_memberships (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_household_membership_role CHECK (role IN ('OWNER', 'MEMBER')),
    CONSTRAINT uq_household_membership UNIQUE (household_id, user_id)
);

INSERT INTO household_memberships (household_id, user_id, role, joined_at)
SELECT u.household_id, u.id,
       CASE WHEN h.owner_user_id = u.id THEN 'OWNER' ELSE 'MEMBER' END,
       COALESCE(u.created_at, CURRENT_TIMESTAMP)
FROM users u
JOIN households h ON h.id = u.household_id
ON CONFLICT (household_id, user_id) DO NOTHING;

INSERT INTO household_memberships (household_id, user_id, role, joined_at)
SELECT h.id, h.owner_user_id, 'OWNER', COALESCE(h.created_at, CURRENT_TIMESTAMP)
FROM households h
ON CONFLICT (household_id, user_id) DO UPDATE SET role = 'OWNER';

CREATE INDEX idx_household_memberships_user ON household_memberships (user_id);
CREATE INDEX idx_household_memberships_household ON household_memberships (household_id);
