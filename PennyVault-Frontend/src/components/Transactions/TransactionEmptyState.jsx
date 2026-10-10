import React from "react";
import {
  IconPlus,
  IconWallet,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";

function TransactionEmptyState({
  emptyState,
  clearForm,
  setEditingTransactionId,
  setIsAddTransactionOpen,
  clearSearch,
  clearFilters,
}) {
  return (
              <div className="empty-state-content">

                <div
                  className={`empty-state-icon ${emptyState.type}`}
                >
                  {emptyState.icon === "wallet" && (
                    <IconWallet size={28} />
                  )}

                  {emptyState.icon === "search" && (
                    <IconSearch size={28} />
                  )}

                  {emptyState.icon === "filter" && (
                    <IconFilter size={28} />
                  )}
                </div>

                <h3>{emptyState.title}</h3>

                <p>{emptyState.message}</p>

                <div className="empty-state-actions">

                  {emptyState.type === "no-transactions" && (
                    <button
                      type="button"
                      className="empty-state-primary-button"
                      onClick={() => {
                        clearForm();
                        setEditingTransactionId(null);
                        setIsAddTransactionOpen(true);
                      }}
                    >
                      <IconPlus size={17} />
                      Add transaction
                    </button>
                  )}

                  {emptyState.type === "search" && (
                    <button
                      type="button"
                      className="empty-state-secondary-button"
                      onClick={clearSearch}
                    >
                      Clear search
                    </button>
                  )}

                  {emptyState.type === "filters" && (
                    <button
                      type="button"
                      className="empty-state-secondary-button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  )}

                  {emptyState.type === "search-and-filter" && (
                    <button
                      type="button"
                      className="empty-state-secondary-button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  )}

                </div>

              </div>
  );
}

export default TransactionEmptyState;
