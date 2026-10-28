-- Store requests to join an existing household separately from membership.
-- Membership changes only after an authorized household owner approves a request.

CREATE TABLE household_join_requests (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    requester_user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by_user_id BIGINT,

    CONSTRAINT fk_join_request_household
        FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_join_request_requester
        FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_join_request_reviewer
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id),
    CONSTRAINT chk_join_request_status
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Prevent duplicate pending requests for the same household and requester.
CREATE UNIQUE INDEX uq_household_join_request_pending
    ON household_join_requests (household_id, requester_user_id)
    WHERE status = 'PENDING';

-- Support loading the pending requests for a household's owner to review.
CREATE INDEX idx_household_join_requests_household_status
    ON household_join_requests (household_id, status);

-- Support a user's request history.
CREATE INDEX idx_household_join_requests_requester_requested_at
    ON household_join_requests (requester_user_id, requested_at DESC);
