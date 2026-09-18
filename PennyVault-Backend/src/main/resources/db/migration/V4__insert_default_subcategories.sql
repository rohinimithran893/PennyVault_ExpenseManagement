-- Home & Utilities
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Rent'),
    ('Electricity'),
    ('Water'),
    ('LPG/Gas'),
    ('Internet'),
    ('Mobile Recharge'),
    ('Household Supplies'),
    ('Maid/Househelp'),
    ('Security/Society Maintenance'),
    ('Home Repair & Maintenance')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Home & Utilities';


-- Food & Groceries
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Groceries'),
    ('Vegetables & Fruits'),
    ('Meat & Seafood'),
    ('Dairy & Bakery'),
    ('Dining Out'),
    ('Food Delivery'),
    ('Snacks & Coffee')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Food & Groceries';


-- Transport
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Fuel'),
    ('Cab/Auto'),
    ('Public Transport'),
    ('Parking & Toll'),
    ('Vehicle Service'),
    ('Vehicle Insurance'),
    ('Car Wash'),
    ('Tyres & Accessories')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Transport';


-- Health & Wellness
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Doctor/Hospital'),
    ('Medicine'),
    ('Lab Tests & Scans'),
    ('Dental Care'),
    ('Eye Care'),
    ('Mental Health'),
    ('Fitness & Gym'),
    ('Health Insurance')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Health & Wellness';


-- Education & Kids
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('School Fees'),
    ('Tuition/Coaching'),
    ('Books & Stationery'),
    ('Online Courses'),
    ('Child Care'),
    ('Baby Care')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Education & Kids';


-- Finance & Investments
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Home Loan/EMI'),
    ('Car Loan EMI'),
    ('Personal Loan EMI'),
    ('SIP'),
    ('Mutual Funds'),
    ('Stocks'),
    ('Fixed Deposit (FD)'),
    ('Recurring Deposit (RD)'),
    ('PPF'),
    ('NPS'),
    ('NSC'),
    ('EPF'),
    ('Chit Fund'),
    ('Crypto'),
    ('ATM Charges'),
    ('Bank Charges'),
    ('Loan Processing Fee'),
    ('Interest Paid'),
    ('Gold Investments')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Finance & Investments';


-- Travel
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Flights'),
    ('Train/Bus'),
    ('Hotels'),
    ('Local Transport'),
    ('Sightseeing'),
    ('Vacation Shopping')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Travel';


-- Gifts & Donations
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Birthdays'),
    ('Weddings'),
    ('Festivals'),
    ('Gifts'),
    ('Temple'),
    ('Charity'),
    ('Family & Support')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Gifts & Donations';


-- Income
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Salary'),
    ('Freelance'),
    ('Business Income'),
    ('Rental Income'),
    ('Interest Income'),
    ('Dividends'),
    ('Cashback & Rewards'),
    ('Gifts Received'),
    ('Other Income')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Income';


-- Shopping
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Clothing'),
    ('Footwear'),
    ('Accessories'),
    ('Electronics'),
    ('Furniture'),
    ('General Shopping')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Shopping';


-- Personal Care
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Salon & Grooming'),
    ('Cosmetics'),
    ('Personal Hygiene'),
    ('Spa & Wellness')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Personal Care';

-- Entertainment
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Movies'),
    ('Gaming'),
    ('Music'),
    ('OTT & Streaming'),
    ('Events & Shows'),
    ('Hobbies')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Entertainment';

-- Work & Business
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Business Travel')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Work & Business';

-- Subscriptions
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('OTT'),
    ('Music'),
    ('Cloud Storage'),
    ('News & Magazines'),
    ('Software'),
    ('Learning Platforms')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Subscriptions';

-- Pets
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Pet Food'),
    ('Vet'),
    ('Grooming'),
    ('Accessories')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Pets';

-- Taxes & Government
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Income Tax'),
    ('Property Tax'),
    ('Road Tax'),
    ('Traffic Tax'),
    ('Passport/Visa'),
    ('Government Fees')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Taxes & Government';

-- Transfers
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Transfers')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Transfers';

-- Miscellaneous
INSERT INTO subcategories (name, category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Uncategorised'),
    ('Other Expenses')
) AS v(name)
CROSS JOIN categories c
WHERE c.name = 'Miscellaneous';