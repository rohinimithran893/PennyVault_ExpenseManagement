import React, { useState } from "react";
import {
  IconCalendar,
  IconChevronDown,
  IconSearch,
  IconDownload,
  IconPlus,
  IconPencil,
  IconUsers,
  IconUser,
  IconArrowDown,
  IconArrowUp,
  IconDotsVertical,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutList,
  IconChartDonut,
} from "@tabler/icons-react";

import "../Styles/Transactions.css";

function TransactionPage() {
  const [transactionType, setTransactionType] = useState("debit");

  const transactions = [
    {
      date: "15 Aug 2026",
      description: "Swiggy order",
      category: "Food & Groceries",
      categoryClass: "food",
      subcategory: "Groceries",
      paidBy: "R",
      amount: "₹293",
      type: "Debit",
    },
    {
      date: "14 Aug 2026",
      description: "Electricity Bill",
      category: "Utilities",
      categoryClass: "utilities",
      subcategory: "Electricity",
      paidBy: "R",
      amount: "₹2,500",
      type: "Debit",
    },
    {
      date: "13 Aug 2026",
      description: "Salary Received",
      category: "Income",
      categoryClass: "income",
      subcategory: "Salary",
      paidBy: "R",
      amount: "₹75,000",
      type: "Credit",
    },
    {
      date: "12 Aug 2026",
      description: "Amazon Purchase",
      category: "Shopping",
      categoryClass: "shopping",
      subcategory: "Household",
      paidBy: "R",
      amount: "₹1,299",
      type: "Debit",
    },
    {
      date: "11 Aug 2026",
      description: "Fuel - Office",
      category: "Transport",
      categoryClass: "transport",
      subcategory: "Fuel",
      paidBy: "R",
      amount: "₹800",
      type: "Debit",
    },
  ];

  return (
    <div className="transactions-page">

      {/* PAGE HEADER */}
      <div className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p>View, add and manage all your transactions</p>
        </div>

        <div className="transactions-header-actions">
          <div className="transaction-search">
            <IconSearch size={19} />
            <input placeholder="Search transactions..." />
          </div>

          <button className="icon-button">
            <IconCalendar size={20} />
          </button>

          <button className="icon-button">
            <IconDotsVertical size={20} />
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="transaction-filter-bar">

        <button className="filter-select">
          <IconCalendar size={18} />
          <span>This month</span>
          <IconChevronDown size={17} />
        </button>

        <button className="filter-select">
          <span>All categories</span>
          <IconChevronDown size={17} />
        </button>

        <button className="filter-select">
          <span>All types</span>
          <IconChevronDown size={17} />
        </button>

        <div className="filter-search">
          <IconSearch size={18} />
          <input placeholder="Search..." />
        </div>

        <div className="filter-actions">
          <button className="secondary-button">
            <IconDownload size={18} />
            Export
          </button>

          <button className="primary-button">
            <IconPlus size={19} />
            Add transaction
          </button>
        </div>
      </div>

      {/* ADD TRANSACTION */}
      <div className="add-transaction-card">

        <div className="add-transaction-header">
          <div className="add-title">
            <div className="add-icon">
              <IconPencil size={20} />
            </div>

            <h2>Add new transaction</h2>
          </div>

          <div className="paid-options">
            <button className="paid-option active">
              <IconUsers size={18} />
              One member
            </button>

            <button className="paid-option">
              <IconUsers size={18} />
              Split equally
            </button>
          </div>
        </div>

        <div className="transaction-form">

          {/* DATE */}
          <div className="form-field">
            <label>Date</label>

            <div className="input-with-icon">
              <input
                type="text"
                value="15/08/2026"
                readOnly
              />
              <IconCalendar size={18} />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="form-field">
            <label>Description</label>

            <input
              type="text"
              placeholder="e.g. Swiggy order"
            />
          </div>

          {/* CATEGORY */}
          <div className="form-field">
            <label>Category</label>

            <div className="select-input">
              <span>Select category</span>
              <IconChevronDown size={18} />
            </div>
          </div>

          {/* SUBCATEGORY */}
          <div className="form-field">
            <label>Subcategory</label>

            <div className="select-input">
              <span>Select subcategory</span>
              <IconChevronDown size={18} />
            </div>
          </div>

          {/* AMOUNT */}
          <div className="form-field">
            <label>Amount (₹)</label>

            <input
              type="text"
              placeholder="0.00"
            />
          </div>

        </div>

        {/* TYPE + ACTIONS */}
        <div className="transaction-form-footer">

          <div className="type-section">
            <label>Type</label>

            <div className="type-buttons">

              <button
                className={`type-button ${
                  transactionType === "debit" ? "selected debit" : ""
                }`}
                onClick={() => setTransactionType("debit")}
              >
                <IconArrowDown size={18} />
                Debit
              </button>

              <button
                className={`type-button ${
                  transactionType === "credit" ? "selected credit" : ""
                }`}
                onClick={() => setTransactionType("credit")}
              >
                <IconArrowUp size={18} />
                Credit
              </button>

            </div>
          </div>

          <div className="form-actions">
            <button className="clear-button">
              Clear
            </button>

            <button className="save-button">
              Save transaction
            </button>
          </div>

        </div>
      </div>

      {/* TRANSACTIONS LIST */}
      <div className="transactions-list-card">

        {/* LIST HEADER */}
        <div className="transactions-list-header">

          <div>
            <h2>Transactions list</h2>

            <div className="transaction-tabs">
              <button className="transaction-tab active">
                All
              </button>

              <button className="transaction-tab">
                Debit
              </button>

              <button className="transaction-tab">
                Credit
              </button>
            </div>
          </div>

          <div className="list-header-right">

            <div className="list-search">
              <IconSearch size={18} />
              <input placeholder="Search in transactions..." />
            </div>

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

                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Paid by</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {transactions.map((transaction, index) => (
                <tr key={index}>

                  <td>
                    <input type="checkbox" />
                  </td>

                  <td className="date-cell">
                    {transaction.date}
                  </td>

                  <td className="description-cell">
                    <div className="transaction-description">
                      <div className={`transaction-symbol ${transaction.categoryClass}`}>
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
                      {transaction.type === "Credit" ? "+" : "-"}
                      {transaction.amount}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`transaction-type ${
                        transaction.type.toLowerCase()
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td>
                    <button className="row-action">
                      <IconDotsVertical size={19} />
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="transactions-pagination">

          <span>
            Showing 1 to 5 of 42 transactions
          </span>

          <div className="pagination-buttons">

            <button>
              <IconChevronLeft size={18} />
            </button>

            <button className="current-page">
              1
            </button>

            <button>2</button>
            <button>3</button>

            <span>...</span>

            <button>9</button>

            <button>
              <IconChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default TransactionPage;