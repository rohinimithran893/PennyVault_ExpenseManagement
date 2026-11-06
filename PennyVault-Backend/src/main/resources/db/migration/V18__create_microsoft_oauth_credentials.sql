CREATE TABLE microsoft_oauth_credentials (
    mailbox_email VARCHAR(320) PRIMARY KEY,
    encrypted_refresh_token TEXT NOT NULL,
    initialization_vector VARCHAR(24) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
