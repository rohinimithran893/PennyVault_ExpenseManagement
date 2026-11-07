CREATE TABLE microsoft_oauth_states (
    state_hash VARCHAR(64) PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_microsoft_oauth_states_expires_at
    ON microsoft_oauth_states (expires_at);
