ALTER TABLE household_members
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP NULL;

CREATE TABLE household_invitations (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    invited_by_user_id BIGINT NOT NULL REFERENCES users(id),
    email VARCHAR(254) NOT NULL,
    member_role VARCHAR(20) NOT NULL CHECK (member_role IN ('CO_OWNER', 'MEMBER', 'VIEWER')),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ACCEPTED', 'CANCELLED', 'EXPIRED')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL
);

CREATE INDEX idx_household_invitations_household_status
    ON household_invitations(household_id, status);
CREATE INDEX idx_household_invitations_email
    ON household_invitations(LOWER(email));
