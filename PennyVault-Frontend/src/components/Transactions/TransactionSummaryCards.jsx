import React from "react";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
} from "@tabler/icons-react";

function TransactionSummaryCards({
  transactionAmount,
  totalIncome,
  totalExpenses,
  filteredTransactions,
  formatTransactionAmount,
}) {
  const incomeTransactionCount = filteredTransactions.filter(
    (transaction) => transaction.type?.toLowerCase() === "credit",
  ).length;

  const expenseTransactionCount = filteredTransactions.filter(
    (transaction) => transaction.type?.toLowerCase() === "debit",
  ).length;

  return (
    <div className="transaction-summary-cards" aria-label="Transaction summary">
      <article className="transaction-summary-card transaction-summary-amount">
        <div className="transaction-summary-icon">
          <IconWallet size={28} stroke={2} />
        </div>
        <div className="transaction-summary-content">
          <h2>Transaction Amount</h2>
          <p className="transaction-summary-value">
            {formatTransactionAmount(transactionAmount)}
          </p>
          <span>Total income plus expenses</span>
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
