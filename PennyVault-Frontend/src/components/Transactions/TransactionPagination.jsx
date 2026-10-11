import React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

function TransactionPagination({
  filteredTransactionsCount,
  startIndex,
  itemsPerPage,
  totalPages,
  paginationItems,
  currentPage,
  setCurrentPage,
}) {
  if (filteredTransactionsCount === 0) {
    return null;
  }

  return (
    <div className="transactions-pagination">
      <span className="pagination-summary">
        Showing {startIndex + 1} to{" "}
        {Math.min(startIndex + itemsPerPage, filteredTransactionsCount)} of{" "}
        {filteredTransactionsCount} transactions
      </span>

      {totalPages > 1 && (
        <div className="pagination-buttons">
          <button
            type="button"
            className="pagination-nav-button"
            onClick={() =>
              setCurrentPage((page) => Math.max(page - 1, 1))
            }
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <IconChevronLeft size={18} />
          </button>

          {paginationItems.map((item, index) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`${item}-${index}`}
                  className="pagination-ellipsis"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={item}
                type="button"
                className={currentPage === item ? "current-page" : ""}
                onClick={() => setCurrentPage(item)}
                aria-label={`Go to page ${item}`}
                aria-current={currentPage === item ? "page" : undefined}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            className="pagination-nav-button"
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionPagination;
