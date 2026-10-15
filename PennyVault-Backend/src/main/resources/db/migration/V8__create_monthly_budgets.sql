CREATE TABLE monthly_budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    budget_month DATE NOT NULL,
    total_limit DECIMAL(12,2) NOT NULL CHECK (total_limit >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_monthly_budget_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_monthly_budget_user_month
        UNIQUE (user_id, budget_month)
);