CREATE TABLE subcategory_monthly_budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subcategory_id BIGINT NOT NULL,
    budget_month DATE NOT NULL,
    budget_limit DECIMAL(12,2) NOT NULL CHECK (budget_limit >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subcategory_monthly_budget_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_subcategory_monthly_budget_subcategory
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    CONSTRAINT uk_subcategory_monthly_budget_user_subcategory_month
        UNIQUE (user_id, subcategory_id, budget_month)
);

CREATE INDEX idx_subcategory_monthly_budgets_month_user
    ON subcategory_monthly_budgets (user_id, budget_month);