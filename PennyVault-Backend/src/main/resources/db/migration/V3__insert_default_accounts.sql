INSERT INTO accounts
    (user_id, account_name, account_type, balance, currency)
SELECT
    u.id,
    a.account_name,
    a.account_type,
    0.00,
    'INR'
FROM users u
CROSS JOIN (
    VALUES
        ('HDFC Bank', 'SAVINGS'),
        ('UPI', 'UPI'),
        ('Cash', 'CASH'),
        ('Amazon Credit Card', 'CREDIT_CARD'),
        ('HDFC Credit Card', 'CREDIT_CARD'),
        ('Others', 'OTHER')
) AS a(account_name, account_type)
WHERE NOT EXISTS (
    SELECT 1
    FROM accounts existing
    WHERE existing.user_id = u.id
      AND existing.account_name = a.account_name
);