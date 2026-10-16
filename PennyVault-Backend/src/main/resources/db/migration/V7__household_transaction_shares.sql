CREATE TABLE households (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE household_members (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_household_member UNIQUE (household_id, user_id)
);

CREATE TABLE transaction_shares (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    member_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_amount DECIMAL(12,2) NOT NULL CHECK (share_amount >= 0),
    assignment_mode VARCHAR(20) NOT NULL,
    CONSTRAINT uq_transaction_share_member UNIQUE (transaction_id, member_user_id)
);

CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);
CREATE INDEX idx_transaction_shares_member ON transaction_shares(member_user_id);
CREATE INDEX idx_transaction_shares_transaction ON transaction_shares(transaction_id);

INSERT INTO households (owner_user_id)
SELECT id FROM users;

INSERT INTO household_members (household_id, user_id, member_role)
SELECT h.id, h.owner_user_id, 'OWNER' FROM households h;
