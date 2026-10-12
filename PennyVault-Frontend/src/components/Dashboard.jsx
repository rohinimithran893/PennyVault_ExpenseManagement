import React from "react";
import {
  IconSearch,
  IconBell,
  IconWallet,
  IconCreditCard,
  IconPigMoney,
  IconFileInvoice,
} from "@tabler/icons-react";

import "../Styles/Dashboard.css";

const summaryCards = [
  {
    title: "Total balance",
    value: "—",
    subtitle: "Coming soon",
    icon: IconWallet,
    type: "default",
  },
  {
    title: "Monthly spend",
    value: "₹7,093",
    subtitle: "12% of budget used",
    icon: IconCreditCard,
    type: "spend",
  },
  {
    title: "Savings goal",
    value: "—",
    subtitle: "Coming soon",
    icon: IconPigMoney,
    type: "default",
  },
  {
    title: "Bills due",
    value: "—",
    subtitle: "Coming soon",
    icon: IconFileInvoice,
    type: "default",
  },
];

const spendingCategories = [
  {
    name: "Home & Utilities",
    amount: "₹6,800",
    percentage: 100,
    type: "purple",
  },
  {
    name: "Food & Groceries",
    amount: "₹293",
    percentage: 4.3,
    type: "green",
  },
  {
    name: "Transport",
    amount: "₹0",
    percentage: 0,
    type: "empty",
  },
  {
    name: "Health",
    amount: "₹0",
    percentage: 0,
    type: "empty",
  },
  {
    name: "Education & Kids",
    amount: "₹0",
    percentage: 0,
    type: "empty",
  },
  {
    name: "Entertainment & Lifestyle",
    amount: "₹0",
    percentage: 0,
    type: "empty",
  },
  {
    name: "Finance & Others",
    amount: "₹0",
    percentage: 0,
    type: "empty",
  },
];

const budgetUsedPercent = 12;

function Dashboard() {

    const donutRadius = 44;
    const donutCircumference = 2 * Math.PI * donutRadius;
    
  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}
      <header className="dashboard-header">

        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Welcome back, Rohini 👋</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <IconSearch size={17} stroke={1.7} />
            <input
              type="text"
              placeholder="Search transactions..."
            />
          </div>
          <button className="notification-button">
            <IconBell size={17} stroke={1.7} />
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="dashboard-content">
        {/* Page heading */}
        <div className="page-heading">
          <h2>Overview</h2>
          <p>August 2026 · Family Plan</p>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <section className="summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                className={`summary-card ${card.type}`}
                key={card.title}
              >
                <div className="summary-icon">
                  <Icon size={20} stroke={1.8} />
                </div>

                <div className="summary-info">
                  <span className="summary-title">
                    {card.title}
                  </span>

                  <strong className="summary-value">
                    {card.value}
                  </strong>

                  <span className="summary-subtitle">
                    {card.subtitle}
                  </span>
                </div>

              </div>
            );
          })}
        </section>

        {/* ================= LOWER SECTION ================= */}
        <section className="dashboard-grid">
          {/* Spending by category */}
          <div className="dashboard-card spending-card">
            <div className="card-heading">
              <h3>SPENDING BY CATEGORY</h3>
            </div>

            <div className="category-list">
              {spendingCategories.map((category) => (
                <div
                  className="category-row"
                  key={category.name}
                >
                  <div className="category-name">
                    {category.name}
                  </div>

                  <div className="category-progress">
                    <div className="progress-background">
                      <div
                        className={`progress-fill ${category.type}`}
                        style={{
                          width: `${category.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="category-amount">
                    {category.amount}
                  </div>

                </div>
              ))}
            </div>
          </div>


          {/* Budget used */}
          <div className="dashboard-card budget-card">
            <div className="card-heading">
              <h3>BUDGET USED</h3>
            </div>

            {/* Donut chart */}
            <div className="budget-chart">
              <div className="donut">
                <svg className="donut-svg" viewBox="0 0 105 105">
                    <circle className="donut-track" cx="52.5" cy="52.5" r={donutRadius} />
                        <circle className="donut-progress" cx="52.5" cy="52.5" r={donutRadius}
                            strokeDasharray={donutCircumference}
                            strokeDashoffset={donutCircumference - (donutCircumference * budgetUsedPercent) / 100}
                        />
                </svg>
                <div className="donut-center">
                  <strong>{budgetUsedPercent}%</strong>
                  <span>used</span>
                </div>
              </div>
            </div>

            {/* Budget details */}
            <div className="budget-details">
              <div className="budget-row">
                <div className="budget-label">
                  <span className="legend-dot used"></span>
                  <span>Used</span>
                </div>
                <strong>₹7,093</strong>
              </div>

              <div className="budget-row">
                <div className="budget-label">
                  <span className="legend-dot remaining"></span>
                  <span>Remaining</span>
                </div>
                <strong>₹50,907</strong>
              </div>

              <div className="budget-row total">
                <span>Total budget</span>
                <strong>₹58,000</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;