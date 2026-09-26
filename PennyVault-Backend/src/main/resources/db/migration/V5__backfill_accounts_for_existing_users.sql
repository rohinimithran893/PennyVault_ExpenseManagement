INSERT INTO accounts (
    user_id,
    account_name,
    account_type,
    balance,
    currency
)
SELECT
    u.id,
    t.account_name,
    t.account_type,
    0.00,
    'INR'
FROM users u
CROSS JOIN account_templates t
WHERE NOT EXISTS (
    SELECT 1
    FROM accounts a
    WHERE a.user_id = u.id
);