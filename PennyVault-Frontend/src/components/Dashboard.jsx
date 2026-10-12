import React, { useEffect, useMemo, useState } from "react";
import { getToken } from "../utils/auth";
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

const budgetUsedPercent = 12;

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isSpendingCategoriesLoading, setIsSpendingCategoriesLoading] = useState(true);
  const [spendingCategoriesError, setSpendingCategoriesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      setIsSpendingCategoriesLoading(true);
      setSpendingCategoriesError("");

      try {
        const token = getToken();
        const response = await fetch("http://localhost:8080/api/transactions", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Please log in again to view spending categories."
              : "Unable to load spending categories."
          );
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The transactions response was not in the expected format.");
        }

        if (isMounted) setTransactions(data);
      } catch (error) {
        if (isMounted) {
          setSpendingCategoriesError(error.message || "Unable to load spending categories.");
        }
      } finally {
        if (isMounted) setIsSpendingCategoriesLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  const spendingCategories = useMemo(() => {
    const now = new Date();
    const totalsByCategory = new Map();

    transactions.forEach((transaction) => {
      const type = String(transaction.transactionType ?? transaction.type ?? "").toLowerCase();
      const dateValue = transaction.transactionDate ?? transaction.date;
      const amount = Number(transaction.amount);

      if (type !== "expense" && type !== "debit") return;
      if (!dateValue || !Number.isFinite(amount) || amount <= 0) return;

      // Parse date-only API values in local time to avoid timezone shifts.
      const transactionDate = /^\\d{4}-\\d{2}-\\d{2}$/.test(String(dateValue))
        ? new Date(`${dateValue}T00:00:00`)
        : new Date(dateValue);

      if (
        Number.isNaN(transactionDate.getTime()) ||
        transactionDate.getFullYear() !== now.getFullYear() ||
        transactionDate.getMonth() !== now.getMonth()
      ) {
        return;
      }

      const categoryName = String(
        typeof transaction.category === "string"
          ? transaction.category
          : transaction.category?.name ?? ""
      ).trim() || "Uncategorized";

      totalsByCategory.set(
        categoryName,
        (totalsByCategory.get(categoryName) || 0) + amount
      );
    });

    const sortedCategories = [...totalsByCategory.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const maxAmount = sortedCategories[0]?.total || 0;
    const colors = ["purple", "green", "blue", "pink", "orange", "teal"];

    return sortedCategories.map((category, index) => ({
      name: category.name,
      amount: `₹${category.total.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      percentage: maxAmount > 0 ? (category.total / maxAmount) * 100 : 0,
      type: colors[index % colors.length],
    }));
  }, [transactions]);

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
              {isSpendingCategoriesLoading ? (
                <p>Loading spending categories...</p>
              ) : spendingCategoriesError ? (
                <p role="status">{spendingCategoriesError}</p>
              ) : spendingCategories.length === 0 ? (
                <p>No expense transactions for this month yet.</p>
              ) : (
                spendingCategories.map((category) => (
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
                ))
              )}
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