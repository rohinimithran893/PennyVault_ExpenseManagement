-- Explicit transaction-level sharing. A household can only see active shares.
CREATE TABLE transaction_shares (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    shared_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE UNIQUE INDEX uq_active_transaction_household_share
    ON transaction_shares (transaction_id, household_id)
    WHERE revoked_at IS NULL;

CREATE INDEX idx_transaction_shares_household_active
    ON transaction_shares (household_id, shared_at DESC)
    WHERE revoked_at IS NULL;

CREATE INDEX idx_transaction_shares_transaction
    ON transaction_shares (transaction_id);
