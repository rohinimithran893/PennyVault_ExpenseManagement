import React from "react";
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";

function TransactionToolbar({
  filterSearchTerm,
  handleSearchChange,
  hasActiveFilters,
  activeFilterChips,
  openAdvancedFilters,
  clearAll,
  exportMenuRef,
  isExportMenuOpen,
  setIsExportMenuOpen,
  exportTransactions,
  removeActiveFilter,
  clearFilters,
}) {
  return (
    <>
      <div className="transaction-filter-bar">
        <div className="filter-search">
          <IconSearch size={18} />

          <input
            type="text"
            placeholder="Search..."
            value={filterSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`advanced-filter-button ${
            hasActiveFilters ? "active" : ""
          }`}
          onClick={openAdvancedFilters}
        >
          <IconFilter size={17} />

          <span>Filters</span>

          {hasActiveFilters && (
            <span className="advanced-filter-count">
              {activeFilterChips.length}
            </span>
          )}
        </button>

        <button
          type="button"
          className="clear-filters-button"
          onClick={clearAll}
        >
          Clear
        </button>

        <div className="filter-actions">
          <div className="export-menu-container" ref={exportMenuRef}>
            <button
              type="button"
              className="secondary-button"
              aria-haspopup="menu"
              aria-expanded={isExportMenuOpen}
              onClick={() => setIsExportMenuOpen((isOpen) => !isOpen)}
            >
              <IconDownload size={18} />
              Export
              <IconChevronDown size={15} />
            </button>

            {isExportMenuOpen && (
              <div className="export-menu" role="menu" aria-label="Export transactions">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => exportTransactions("csv")}
                >
                  <IconDownload size={17} />
                  <span>
                    <strong>Export as CSV</strong>
                    <small>.csv spreadsheet file</small>
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => exportTransactions("xlsx")}
                >
                  <IconDownload size={17} />
                  <span>
                    <strong>Export as Excel</strong>
                    <small>.xlsx workbook</small>
                  </span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {activeFilterChips.length > 0 && (
        <div className="active-filters" aria-label="Active filters">
          <span className="active-filters-title">Active filters</span>
          <div className="active-filter-chips">
            {activeFilterChips.map((filter) => (
              <span className="active-filter-chip" key={filter.key}>
                {filter.label}
                <button
                  type="button"
                  onClick={() => removeActiveFilter(filter.key)}
                  aria-label={`Remove ${filter.label} filter`}
                  title={`Remove ${filter.label} filter`}
                >
                  <IconX size={14} />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="active-filters-clear"
              onClick={clearFilters}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TransactionToolbar;
