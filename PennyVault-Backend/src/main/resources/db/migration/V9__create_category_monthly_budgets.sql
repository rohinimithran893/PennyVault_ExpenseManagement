CREATE TABLE category_monthly_budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    budget_month DATE NOT NULL,
    budget_limit DECIMAL(12,2) NOT NULL CHECK (budget_limit >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_monthly_budget_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_category_monthly_budget_category
        FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT uk_category_monthly_budget_user_category_month
        UNIQUE (user_id, category_id, budget_month)
);