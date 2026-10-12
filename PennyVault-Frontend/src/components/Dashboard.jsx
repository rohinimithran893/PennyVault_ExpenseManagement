import React, { useEffect, useMemo, useState } from "react";
import {
  IconWallet,
  IconCreditCard,
  IconPigMoney,
  IconFileInvoice,
} from "@tabler/icons-react";

import { getToken } from "../utils/auth";
import "../Styles/Dashboard.css";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const toDate = (value) => {
  if (!value) return null;
  const parts = String(value).split("-").map(Number);
  if (parts.length === 3 && parts.every(Number.isFinite)) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isIncome = (transaction) =>
  String(transaction.transactionType || transaction.type || "").toLowerCase() === "income";

const getTransactionCategory = (transaction) =>
  String(transaction.category || "Uncategorized").trim() || "Uncategorized";

const categoryColors = ["purple", "green", "blue", "pink", "orange", "teal"];

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const token = getToken();
        const response = await fetch("http://localhost:8080/api/transactions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : "We couldn't load your transactions right now."
          );
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The transactions response was not in the expected format.");
        }

        if (isMounted) setTransactions(data);
      } catch (error) {
        if (isMounted) setLoadError(error.message || "Unable to load dashboard data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardData = useMemo(() => {
    const now = new Date();
    const monthTransactions = transactions.filter((transaction) => {
      const date = toDate(transaction.transactionDate || transaction.date);
      return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });

    const income = monthTransactions.reduce(
      (sum, transaction) => sum + (isIncome(transaction) ? Number(transaction.amount) || 0 : 0),
      0
    );
    const expenses = monthTransactions.reduce(
      (sum, transaction) => sum + (!isIncome(transaction) ? Number(transaction.amount) || 0 : 0),
      0
    );

    const categoryTotals = monthTransactions
      .filter((transaction) => !isIncome(transaction))
      .reduce((totals, transaction) => {
        const category = getTransactionCategory(transaction);
        totals[category] = (totals[category] || 0) + (Number(transaction.amount) || 0);
        return totals;
      }, {});

    const categories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    const maxCategoryAmount = Math.max(...categories.map((category) => category.amount), 0);

    const recentTransactions = [...transactions]
      .sort((a, b) => {
        const dateA = toDate(a.transactionDate || a.date)?.getTime() || 0;
        const dateB = toDate(b.transactionDate || b.date)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      monthLabel: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      income,
      expenses,
      net: income - expenses,
      monthTransactionCount: monthTransactions.length,
      categories: categories.map((category, index) => ({
        ...category,
        percentage: maxCategoryAmount ? (category.amount / maxCategoryAmount) * 100 : 0,
        type: categoryColors[index % categoryColors.length],
      })),
      recentTransactions,
    };
  }, [transactions]);

  const donutRadius = 44;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const summaryCards = [
    {
      title: "Monthly income",
      value: formatCurrency(dashboardData.income),
      subtitle: "From income transactions this month",
      icon: IconWallet,
      type: "default",
    },
    {
      title: "Monthly spend",
      value: formatCurrency(dashboardData.expenses),
      subtitle: `${dashboardData.monthTransactionCount} transactions this month`,
      icon: IconCreditCard,
      type: "spend",
    },
    {
      title: "Net cash flow",
      value: formatCurrency(dashboardData.net),
      subtitle: "Income minus expenses this month",
      icon: IconPigMoney,
      type: "default",
    },
    {
      title: "All transactions",
      value: transactions.length.toLocaleString("en-IN"),
      subtitle: "Across all recorded dates",
      icon: IconFileInvoice,
      type: "default",
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Your finances at a glance</p>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <h2>Overview</h2>
          <p>{dashboardData.monthLabel}</p>
        </div>

        {loadError && (
          <div className="dashboard-status dashboard-error" role="alert">
            <span>{loadError}</span>
            <button type="button" onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}

        {isLoading ? (
          <div className="dashboard-status" role="status">Loading your financial summary…</div>
        ) : !loadError && transactions.length === 0 ? (
          <div className="dashboard-status">
            No transactions yet. Add your first transaction to see your financial summary here.
          </div>
        ) : null}

        <section className="summary-grid" aria-label="Monthly financial summary">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div className={`summary-card ${card.type}`} key={card.title}>
                <div className="summary-icon"><Icon size={20} stroke={1.8} /></div>
                <div className="summary-info">
                  <span className="summary-title">{card.title}</span>
                  <strong className="summary-value">{isLoading ? "—" : card.value}</strong>
                  <span className="summary-subtitle">{card.subtitle}</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card spending-card">
            <div className="card-heading"><h3>SPENDING BY CATEGORY</h3></div>
            {dashboardData.categories.length ? (
              <div className="category-list">
                {dashboardData.categories.map((category) => (
                  <div className="category-row" key={category.name}>
                    <div className="category-name">{category.name}</div>
                    <div className="category-progress">
                      <div className="progress-background">
                        <div
                          className={`progress-fill ${category.type}`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="category-amount">{formatCurrency(category.amount)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty">No expense transactions recorded for this month.</p>
            )}
          </div>

          <div className="dashboard-card budget-card">
            <div className="card-heading"><h3>BUDGET OVERVIEW</h3></div>
            <div className="dashboard-budget-note">
              <div className="budget-chart">
                <div className="donut">
                  <svg className="donut-svg" viewBox="0 0 105 105" aria-hidden="true">
                    <circle className="donut-track" cx="52.5" cy="52.5" r={donutRadius} />
                    <circle
                      className="donut-progress"
                      cx="52.5"
                      cy="52.5"
                      r={donutRadius}
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={donutCircumference}
                    />
                  </svg>
                  <div className="donut-center">
                    <strong>—</strong>
                    <span>not linked</span>
                  </div>
                </div>
              </div>
              <p>Budget limits on the Budgets page are currently stored as sample values. This card will show accurate used and remaining amounts once budgets are saved as shared data.</p>
            </div>
          </div>
        </section>

        <section className="dashboard-card recent-transactions-card">
          <div className="card-heading"><h3>RECENT TRANSACTIONS</h3></div>
          {dashboardData.recentTransactions.length ? (
            <div className="recent-transactions-list">
              {dashboardData.recentTransactions.map((transaction, index) => {
                const amount = Number(transaction.amount) || 0;
                const incomeTransaction = isIncome(transaction);
                const date = toDate(transaction.transactionDate || transaction.date);
                return (
                  <div className="recent-transaction-row" key={transaction.id ?? `${transaction.description}-${index}`}>
                    <div className="recent-transaction-main">
                      <strong>{transaction.description || getTransactionCategory(transaction)}</strong>
                      <span>{getTransactionCategory(transaction)}{date ? ` · ${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : ""}</span>
                    </div>
                    <strong className={incomeTransaction ? "transaction-income" : "transaction-expense"}>
                      {incomeTransaction ? "+" : "−"}{formatCurrency(amount)}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="dashboard-empty">Your recent transactions will appear here.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
