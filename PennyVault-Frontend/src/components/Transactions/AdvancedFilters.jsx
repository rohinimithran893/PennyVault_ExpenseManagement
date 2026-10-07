import React from "react";
import {
  IconX,
  IconCheck,
} from "@tabler/icons-react";

function AdvancedFilters({
  isOpen,
  draftTransactionFilter,
  setDraftTransactionFilter,
  draftCategoryFilter,
  setDraftCategoryFilter,
  categories,
  draftDateFilter,
  setDraftDateFilter,
  draftCustomStartDate,
  setDraftCustomStartDate,
  draftCustomEndDate,
  setDraftCustomEndDate,
  draftMinAmount,
  setDraftMinAmount,
  draftMaxAmount,
  setDraftMaxAmount,
  setIsAdvancedFilterOpen,
  applyAdvancedFilters,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="advanced-filter-overlay"
      onClick={() => setIsAdvancedFilterOpen(false)}
    >
      <div
        className="advanced-filter-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="advanced-filter-header">
          <div>
            <h2>Advanced Filters</h2>
            <p>Refine your transaction list</p>
          </div>

          <button
            type="button"
            className="advanced-filter-close"
            onClick={() => setIsAdvancedFilterOpen(false)}
            aria-label="Close filters"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="advanced-filter-body">

          {/* TRANSACTION TYPE */}
          <div className="advanced-filter-section">
            <label>Transaction type</label>

            <div className="filter-choice-group">
              <button
                type="button"
                className={
                  draftTransactionFilter === "all"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDraftTransactionFilter("all")
                }
              >
                All
              </button>

              <button
                type="button"
                className={
                  draftTransactionFilter === "debit"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDraftTransactionFilter("debit")
                }
              >
                Debit
              </button>

              <button
                type="button"
                className={
                  draftTransactionFilter === "credit"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDraftTransactionFilter("credit")
                }
              >
                Credit
              </button>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="advanced-filter-section">
            <label htmlFor="advanced-category-filter">
              Category
            </label>

            <select
              id="advanced-category-filter"
              value={draftCategoryFilter}
              onChange={(event) =>
                setDraftCategoryFilter(event.target.value)
              }
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.name}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div className="advanced-filter-section">
            <label htmlFor="advanced-date-filter">
              Date
            </label>

            <select
              id="advanced-date-filter"
              value={draftDateFilter}
              onChange={(event) =>
                setDraftDateFilter(event.target.value)
              }
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This week</option>
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
              <option value="last3Months">
                Last 3 months
              </option>
              <option value="thisYear">This year</option>
              <option value="custom">Custom range</option>
            </select>

            {draftDateFilter === "custom" && (
              <div className="advanced-filter-date-row">
                <div>
                  <label htmlFor="advanced-start-date">
                    From
                  </label>

                  <input
                    id="advanced-start-date"
                    type="date"
                    value={draftCustomStartDate}
                    onChange={(event) =>
                      setDraftCustomStartDate(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label htmlFor="advanced-end-date">
                    To
                  </label>

                  <input
                    id="advanced-end-date"
                    type="date"
                    value={draftCustomEndDate}
                    onChange={(event) =>
                      setDraftCustomEndDate(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* AMOUNT */}
          <div className="advanced-filter-section">
            <label>Amount range</label>

            <div className="advanced-filter-amount-row">
              <div className="amount-input-wrapper">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={draftMinAmount}
                  onChange={(event) =>
                    setDraftMinAmount(event.target.value)
                  }
                />
              </div>

              <span className="amount-range-separator">
                to
              </span>

              <div className="amount-input-wrapper">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={draftMaxAmount}
                  onChange={(event) =>
                    setDraftMaxAmount(event.target.value)
                  }
                />
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="advanced-filter-footer">
          <button
            type="button"
            className="advanced-filter-clear"
            onClick={() => {
              setDraftTransactionFilter("all");
              setDraftCategoryFilter("");
              setDraftDateFilter("thisMonth");
              setDraftCustomStartDate("");
              setDraftCustomEndDate("");
              setDraftMinAmount("");
              setDraftMaxAmount("");
            }}
          >
            Clear all
          </button>

          <div className="advanced-filter-footer-actions">
            <button
              type="button"
              className="advanced-filter-cancel"
              onClick={() =>
                setIsAdvancedFilterOpen(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="advanced-filter-apply"
              onClick={applyAdvancedFilters}
            >
              <IconCheck size={17} />
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedFilters;