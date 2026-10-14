import React, { useEffect, useMemo, useState } from "react";
import { getToken } from "../utils/auth";
import {
  IconSearch,
  IconBell,
  IconWallet,
  IconCreditCard,
  IconPigMoney,
  IconFileInvoice,
  IconCalendar,
  IconChevronDown,
} from "@tabler/icons-react";
import { getCategoryIcon, getCategoryIconTone } from "./Transactions/CategoryIcon";

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
  const [showAllSpendingCategories, setShowAllSpendingCategories] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  });

  const monthOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    for (let offset = 0; offset < 12; offset += 1) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - offset, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      options.push({
        value,
        label: date.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      });
    }
    return options;
  }, []);

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
    const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
    const totalsByCategory = new Map();

    transactions.forEach((transaction) => {
      const type = String(transaction.transactionType ?? transaction.type ?? "").toLowerCase();
      const dateValue = transaction.transactionDate ?? transaction.date;
      const amount = Number(transaction.amount);

      if (type !== "expense" && type !== "debit") return;
      if (!dateValue || !Number.isFinite(amount) || amount <= 0) return;

      // Parse date-only API values in local time to avoid timezone shifts.
      const transactionDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))
        ? new Date(`${dateValue}T00:00:00`)
        : new Date(dateValue);

      if (
        Number.isNaN(transactionDate.getTime()) ||
        transactionDate.getFullYear() !== selectedYear ||
        transactionDate.getMonth() !== selectedMonthNumber - 1
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

    // Only categories with expenses are shown, sorted from highest to lowest.
    const categoryTotals = [...totalsByCategory.entries()]
      .map(([name, total]) => ({ name, total }))
      .filter((category) => category.total > 0)
      .sort((a, b) => b.total - a.total);

    const maxAmount = Math.max(...categoryTotals.map((category) => category.total), 0);
    const colors = ["purple", "green"];

    return categoryTotals.map((category, index) => ({
      name: category.name,
      amount: `₹${category.total.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      percentage: maxAmount > 0 ? (category.total / maxAmount) * 100 : 0,
      type: colors[index % colors.length],
    }));
  }, [transactions, selectedMonth]);

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
          <div className="page-heading-title">
            <h2>Overview</h2>
            <p className="dashboard-selected-month">{monthOptions.find((month) => month.value === selectedMonth)?.label} · Family Expense Plan</p>
          </div>
          <label className="dashboard-month-picker">
            <IconCalendar size={22} stroke={1.8} aria-hidden="true" />
            <select
              aria-label="Select spending month"
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setShowAllSpendingCategories(false);
              }}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <IconChevronDown size={18} stroke={1.8} aria-hidden="true" />
          </label>
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
            <div className="card-heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <h3>SPENDING BY CATEGORY</h3>
              {!isSpendingCategoriesLoading && !spendingCategoriesError && spendingCategories.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllSpendingCategories((showAll) => !showAll)}
                  style={{ border: "none", background: "transparent", color: "#7955ed", cursor: "pointer", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", padding: 0 }}
                >
                  {showAllSpendingCategories ? "Show less" : "View all"}
                </button>
              )}
            </div>

            <div className="category-list">
              {isSpendingCategoriesLoading ? (
                <p>Loading spending categories...</p>
              ) : spendingCategoriesError ? (
                <p role="status">{spendingCategoriesError}</p>
              ) : spendingCategories.length === 0 ? (
                <p>No expenses this month</p>
              ) : (
                spendingCategories.slice(0, showAllSpendingCategories ? spendingCategories.length : 5).map((category) => (
                  <div
                    className="category-row"
                    key={category.name}
                  >
                    <div className="category-label">
                      <span className={`category-icon ${getCategoryIconTone(category.name)}`}>
                        {React.createElement(getCategoryIcon(category.name), { size: 18, stroke: 1.8, "aria-hidden": true })}
                      </span>
                      <div className="category-name">{category.name}</div>
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