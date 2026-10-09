import React from "react";
import {
  IconX,
  IconPencil,
  IconAlertTriangle,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";

function TransactionOverlays({
  viewingTransaction,
  setViewingTransaction,
  deleteTarget,
  setDeleteTarget,
  isDeletingTransaction,
  accounts,
  getCategoryClass,
  formatTransactionDate,
  handleEditTransaction,
  confirmDeleteTransaction,
}) {
  return (
    <>
      {/* TRANSACTION DETAILS DRAWER */}
      {viewingTransaction && (
        <div
          className="transaction-drawer-overlay"
          onClick={() => setViewingTransaction(null)}
        >
          <aside
            className="transaction-details-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="transaction-drawer-header">
              <div>
                <h2>Transaction Details</h2>
                <p>
                  Complete information about this transaction.
                </p>
              </div>

              <button
                type="button"
                className="drawer-close-button"
                onClick={() => setViewingTransaction(null)}
                title="Close"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="transaction-detail-summary">
              <div
                className={`transaction-detail-symbol ${getCategoryClass(
                  viewingTransaction.category
                )}`}
              >
                {viewingTransaction.transactionType
                  ?.toLowerCase() === "income" ? (
                  <IconArrowUp size={21} />
                ) : (
                  <IconArrowDown size={21} />
                )}
              </div>

              <div className="transaction-detail-summary-text">
                <strong>
                  {viewingTransaction.description ||
                    "Untitled transaction"}
                </strong>

                <span>
                  {viewingTransaction.category ||
                    "Uncategorized"}
                </span>
              </div>

              <div
                className={`transaction-detail-amount ${
                  viewingTransaction.transactionType
                    ?.toLowerCase() === "income"
                    ? "credit-amount"
                    : "debit-amount"
                }`}
              >
                {viewingTransaction.transactionType
                  ?.toLowerCase() === "income"
                  ? "+"
                  : "-"}

                ₹
                {Number(
                  viewingTransaction.amount || 0
                ).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="transaction-details-list">

              <div className="transaction-detail-row">
                <span>Date</span>
                <strong>
                  {formatTransactionDate(
                    viewingTransaction.transactionDate
                  )}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Account</span>
                <strong>
                  {accounts.find(
                    (account) =>
                      String(account.id) ===
                      String(
                        viewingTransaction.accountId
                      )
                  )?.accountName ||
                    viewingTransaction.account ||
                    "-"}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Category</span>
                <strong>
                  {viewingTransaction.category || "-"}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Subcategory</span>
                <strong>
                  {viewingTransaction.subcategory || "-"}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Transaction type</span>

                <span
                  className={`transaction-type ${
                    viewingTransaction.transactionType
                      ?.toLowerCase() === "income"
                      ? "credit"
                      : "debit"
                  }`}
                >
                  {viewingTransaction.transactionType
                    ?.toLowerCase() === "income"
                    ? "Credit"
                    : "Debit"}
                </span>
              </div>

              <div className="transaction-detail-row">
                <span>Amount</span>

                <strong>
                  ₹
                  {Number(
                    viewingTransaction.amount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Description</span>

                <strong>
                  {viewingTransaction.description || "-"}
                </strong>
              </div>
            </div>

            <div className="transaction-drawer-actions">

              <button
                type="button"
                className="drawer-secondary-button"
                onClick={() =>
                  setViewingTransaction(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="drawer-primary-button"
                onClick={() =>
                  handleEditTransaction(
                    viewingTransaction.id
                  )
                }
              >
                <IconPencil size={17} />
                Edit transaction
              </button>

            </div>
          </aside>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="delete-dialog-overlay"
          onClick={() => {
            if (!isDeletingTransaction) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            aria-describedby="delete-transaction-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-dialog-icon">
              <IconAlertTriangle size={24} />
            </div>

            <h2 id="delete-transaction-title">Delete transaction?</h2>

            <p id="delete-transaction-description">
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget.description ||
                  "this transaction"}
              </strong>

              {deleteTarget.amount !== undefined &&
              deleteTarget.amount !== null
                ? ` (₹${Number(
                    deleteTarget.amount
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })})`
                : ""}

              ? This action cannot be undone.
            </p>

            <div className="delete-dialog-actions">

              <button
                type="button"
                className="delete-cancel-button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingTransaction}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={confirmDeleteTransaction}
                disabled={isDeletingTransaction}
              >
                {isDeletingTransaction ? "Deleting..." : "Delete transaction"}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TransactionOverlays;