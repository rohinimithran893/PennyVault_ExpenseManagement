import React from "react";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
} from "@tabler/icons-react";

function TransactionSummaryCards({
  netBalance,
  periodLabel,
  totalIncome,
  totalExpenses,
  filteredTransactions,
  formatTransactionAmount,
}) {
  // Round to paise first so float noise (e.g. 0.1 + 0.2) can't flip the sign.
  const roundedNetBalance = Math.round((Number(netBalance) || 0) * 100) / 100;
  const netBalanceState =
    roundedNetBalance > 0
      ? "positive"
      : roundedNetBalance < 0
        ? "negative"
        : "zero";
  const netBalanceDisplay = `${
    roundedNetBalance < 0 ? "-" : ""
  }${formatTransactionAmount(Math.abs(roundedNetBalance))}`;

  const incomeTransactionCount = filteredTransactions.filter(
    (transaction) => transaction.type?.toLowerCase() === "credit",
  ).length;

  const expenseTransactionCount = filteredTransactions.filter(
    (transaction) => transaction.type?.toLowerCase() === "debit",
  ).length;

  return (
    <div className="transaction-summary-cards" aria-label="Transaction summary">
      <article
        className={`transaction-summary-card transaction-summary-net ${netBalanceState}`}
      >
        <div className="transaction-summary-icon">
          <IconWallet size={28} stroke={2} />
        </div>
        <div className="transaction-summary-content">
          <h2>Net Balance</h2>
          <p className="transaction-summary-value">{netBalanceDisplay}</p>
          <span>
            Income minus expenses{periodLabel ? ` · ${periodLabel}` : ""}
          </span>
        </div>
      </article>

      <article className="transaction-summary-card transaction-summary-income">
        <div className="transaction-summary-icon">
          <IconTrendingUp size={28} stroke={2} />
        </div>
        <div className="transaction-summary-content">
          <h2>Total Income</h2>
          <p className="transaction-summary-value">
            {formatTransactionAmount(totalIncome)}
          </p>
          <span>Across {incomeTransactionCount} transactions</span>
        </div>
      </article>

      <article className="transaction-summary-card transaction-summary-expenses">
        <div className="transaction-summary-icon">
          <IconTrendingDown size={28} stroke={2} />
        </div>
        <div className="transaction-summary-content">
          <h2>Total Expenses</h2>
          <p className="transaction-summary-value">
            {formatTransactionAmount(totalExpenses)}
          </p>
          <span>Across {expenseTransactionCount} transactions</span>
        </div>
      </article>
    </div>
  );
}

export default TransactionSummaryCards;
