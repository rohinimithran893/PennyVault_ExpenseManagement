import React from "react";
import TransactionEmptyState from "./TransactionEmptyState";
import TransactionPagination from "./TransactionPagination";
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconAlertCircle,
  IconArrowDown,
  IconArrowUp,
  IconLayoutList,
  IconChartDonut,
} from "@tabler/icons-react";

function TransactionTable({
  sortConfig,
  handleSort,
  isTransactionsLoading,
  transactionsError,
  paginatedTransactions,
  emptyState,
  clearForm,
  setEditingTransactionId,
  setIsAddTransactionOpen,
  clearSearch,
  clearFilters,
  formatTransactionDate,
  formatTransactionAmount,
  handleViewTransaction,
  handleEditTransaction,
  handleDeleteTransaction,
  filteredTransactions,
  loadTransactions,
}) {
  return (
    <div className="transactions-list-card">

      {/* LIST HEADER */}
      <div className="transactions-list-header">

        <div>
          <h2>Transactions list</h2>


        </div>

        <div className="list-header-right">

          <div className="view-toggle">
            <button className="view-button active">
              <IconLayoutList size={18} />
              List view
            </button>

            <button className="view-button">
              <IconChartDonut size={18} />
              By category
            </button>
          </div>

        </div>

      </div>

      {/* TABLE */}
      <div className="transactions-table-wrapper">

        <table className="transactions-table">

          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>

              <th aria-sort={sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                <button
                  type="button"
                  className={`transaction-sort-button ${
                    sortConfig.key === "date" ? "active" : ""
                  }`}
                  onClick={() => handleSort("date")}
                >
                  <span>Date</span>

                  {sortConfig.key === "date" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={14} />
                    ) : (
                      <IconArrowDown size={14} />
                    )
                  ) : null}
                </button>
              </th>

              <th aria-sort={sortConfig.key === "description" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                <button
                  type="button"
                  className={`transaction-sort-button ${
                    sortConfig.key === "description"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSort("description")}
                >
                  <span>Description</span>

                  {sortConfig.key === "description" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={14} />
                    ) : (
                      <IconArrowDown size={14} />
                    )
                  ) : null}
                </button>
              </th>

              <th aria-sort={sortConfig.key === "category" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                <button
                  type="button"
                  className={`transaction-sort-button ${
                    sortConfig.key === "category"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSort("category")}
                >
                  <span>Category</span>

                  {sortConfig.key === "category" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={14} />
                    ) : (
                      <IconArrowDown size={14} />
                    )
                  ) : null}
                </button>
              </th>

              <th>Subcategory</th>

              <th>Paid by</th>

              <th aria-sort={sortConfig.key === "amount" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                <button
                  type="button"
                  className={`transaction-sort-button ${
                    sortConfig.key === "amount"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSort("amount")}
                >
                  <span>Amount</span>

                  {sortConfig.key === "amount" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={14} />
                    ) : (
                      <IconArrowDown size={14} />
                    )
                  ) : null}
                </button>
              </th>

              <th aria-sort={sortConfig.key === "type" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}>
                <button
                  type="button"
                  className={`transaction-sort-button ${
                    sortConfig.key === "type" ? "active" : ""
                  }`}
                  onClick={() => handleSort("type")}
                >
                  <span>Type</span>

                  {sortConfig.key === "type" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={14} />
                    ) : (
                      <IconArrowDown size={14} />
                    )
                  ) : null}
                </button>
              </th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {/* LOADING */}
            {isTransactionsLoading ? (
              <tr>
                <td
                  colSpan="9"
                  className="transactions-loading-state"
                >
                  <div className="transactions-loading-content">
                    <div className="transactions-loading-spinner"></div>
                    <span>Loading transactions...</span>
                  </div>
                </td>
              </tr>

            /* ERROR */
            ) : transactionsError ? (
              <tr>
                <td
                  colSpan="9"
                  className="transactions-error-state"
                >
                  <div className="transactions-error-content">

                    <div className="transactions-error-icon">
                      <IconAlertCircle size={24} />
                    </div>

                    <h3>Unable to load transactions</h3>

                    <p>
                      We couldn't load your transactions right now.
                      Please try again.
                    </p>

                    <button
                      type="button"
                      className="transactions-retry-button"
                      onClick={loadTransactions}
                    >
                      Try again
                    </button>

                  </div>
                </td>
              </tr>

            /* EMPTY */
            ) : paginatedTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="transactions-empty-state"
                >
                  <TransactionEmptyState
                    emptyState={emptyState}
                    clearForm={clearForm}
                    setEditingTransactionId={setEditingTransactionId}
                    setIsAddTransactionOpen={setIsAddTransactionOpen}
                    clearSearch={clearSearch}
                    clearFilters={clearFilters}
                  />
                </td>
              </tr>

            /* TRANSACTION ROWS */
            ) : (
              paginatedTransactions.map((transaction, index) => (
                <tr key={transaction.id}>

                  <td>
                    <input type="checkbox" />
                  </td>

                  <td className="date-cell">
                    {formatTransactionDate(transaction.date)}
                  </td>

                  <td className="description-cell">
                    <div className="transaction-description">

                      <div
                        className={`transaction-symbol ${transaction.categoryClass}`}
                      >
                        {transaction.type === "Credit" ? (
                          <IconArrowUp size={17} />
                        ) : (
                          <IconArrowDown size={17} />
                        )}
                      </div>

                      <span>
                        {transaction.description}
                      </span>

                    </div>
                  </td>

                  <td>
                    <span
                      className={`category-tag ${transaction.categoryClass}`}
                    >
                      <span className="category-dot"></span>
                      {transaction.category}
                    </span>
                  </td>

                  <td className="subcategory-cell">
                    {transaction.subcategory}
                  </td>

                  <td>
                    <div className="paid-by">
                      <div className="avatar">
                        {transaction.paidBy}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`amount ${
                        transaction.type === "Credit"
                          ? "credit-amount"
                          : "debit-amount"
                      }`}
                    >
                      {transaction.type === "Credit"
                        ? "+"
                        : "-"}

                      {formatTransactionAmount(
                        transaction.amount
                      )}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`transaction-type ${transaction.type.toLowerCase()}`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td>
                    <div className="transaction-actions">

                      <button
                        type="button"
                        className="row-action view-action"
                        onClick={() =>
                          handleViewTransaction(transaction.id)
                        }
                        title="View transaction"
                      >
                        <IconEye size={19} />
                      </button>

                      <button
                        type="button"
                        className="row-action edit-action"
                        onClick={() =>
                          handleEditTransaction(transaction.id)
                        }
                        title="Edit transaction"
                      >
                        <IconPencil size={19} />
                      </button>

                      <button
                        type="button"
                        className="row-action delete-action"
                        onClick={() =>
                          handleDeleteTransaction(transaction)
                        }
                        title="Delete transaction"
                      >
                        <IconTrash size={19} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION SUMMARY AND CONTROLS */}
      <TransactionPagination
        filteredTransactionsCount={filteredTransactions.length}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        paginationItems={paginationItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

    </div>
  );
}

export default TransactionTable;