import React, { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import "../Styles/Transactions.css";
import {
  IconCalendar,
  IconChevronDown,
  IconSearch,
  IconDownload,
  IconPlus,
  IconPencil,
  IconTrash,
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

const getCategoryClass = (category) => {
  if (!category) return "";

  const categoryName = category.toLowerCase();

  if (categoryName.includes("food")) return "food";
  if (categoryName.includes("home")) return "utilities";
  if (categoryName.includes("transport")) return "transport";
  if (categoryName.includes("health")) return "health";
  if (categoryName.includes("education")) return "education";
  if (categoryName.includes("finance")) return "finance";
  if (categoryName.includes("travel")) return "travel";
  if (categoryName.includes("gift")) return "gifts";
  if (categoryName.includes("income")) return "income";
  if (categoryName.includes("shopping")) return "shopping";
  if (categoryName.includes("personal")) return "personal";
  if (categoryName.includes("entertainment")) return "entertainment";
  if (categoryName.includes("work")) return "work";
  if (categoryName.includes("subscription")) return "subscriptions";
  if (categoryName.includes("pets")) return "pets";
  if (categoryName.includes("tax")) return "taxes";
  if (categoryName.includes("transfer")) return "transfers";

  return "miscellaneous";
};

function TransactionPage() {
  const [transactionType, setTransactionType] = useState("debit");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(""); 
  const [transactions, setTransactions] = useState([]);
  const [listSearchTerm, setListSearchTerm] = useState("");
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const token = getToken();
        const response = await fetch("http://localhost:8080/api/accounts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to load accounts");
        }
        const data = await response.json();
        console.log("accounts working");
        console.log("Accounts API:", data);
        setAccounts(data);
      } catch (error) {
        console.error("Error loading accounts:", error);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:8080/api/categories", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  loadCategories();
}, []);

useEffect(() => {
  const loadSubcategories = async () => {

    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId("");
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `http://localhost:8080/api/subcategories/category/${categoryId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load subcategories");
      }

      const data = await response.json();
      setSubcategories(data);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      setSubcategories([]);
      setSubcategoryId("");
    }
  };

  loadSubcategories();
}, [categoryId]);

useEffect(() => {
  const loadTransactions = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:8080/api/transactions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load transactions");
      }

      const data = await response.json();

      const formattedTransactions = data.map((transaction) => ({
        id: transaction.id,
        date: transaction.transactionDate,
        description: transaction.description,
        category: transaction.category,
        categoryClass: getCategoryClass(transaction.category),
        subcategory: transaction.subcategory,
        paidBy: "R",
        amount: `₹${Number(transaction.amount).toLocaleString("en-IN")}`,
        type:
          transaction.transactionType?.toLowerCase() === "income"
            ? "Credit"
            : "Debit",
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  loadTransactions();
}, []);

const saveTransaction = async () => {
  if (
    !accountId ||
    !categoryId ||
    !subcategoryId ||
    !description.trim() ||
    !amount ||
    !transactionDate
  ) {
    alert("Please fill in all transaction details.");
    return;
  }

  try {
    const token = getToken();
    const transactionData = {
      accountId: Number(accountId),
      categoryId: Number(categoryId),
      subcategoryId: Number(subcategoryId),
      description: description.trim(),
      amount: Number(amount),
      transactionType:
        transactionType === "debit" ? "EXPENSE" : "INCOME",
      transactionDate,
    };
    const isEditing = editingTransactionId !== null;
    const url = isEditing
      ? `http://localhost:8080/api/transactions/${editingTransactionId}`
      : "http://localhost:8080/api/transactions";

    const method = isEditing ? "PUT" : "POST";
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Transaction save/update failed:", data);
      alert(data.message || "Failed to save transaction.");
      return;
    }

    console.log(
      isEditing
        ? "Transaction updated successfully:"
        : "Transaction created successfully:",
      data
    );

    if (isEditing) {
      alert("Transaction updated successfully.");
    } else {
      alert("Transaction saved successfully.");
    }

    setEditingTransactionId(null);
    clearForm();
    setIsAddTransactionOpen(false);

    // Reload transactions from backend
    const transactionsResponse = await fetch(
      "http://localhost:8080/api/transactions",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();

      const formattedTransactions = transactionsData.map(
        (transaction) => ({
          id: transaction.id,
          date: transaction.transactionDate,
          description: transaction.description,
          category: transaction.category,
          categoryClass: getCategoryClass(transaction.category),
          subcategory: transaction.subcategory,
          paidBy: "R",
          amount: `₹${Number(transaction.amount).toLocaleString(
            "en-IN"
          )}`,
          type:
            transaction.transactionType?.toLowerCase() === "income"
              ? "Credit"
              : "Debit",
        })
      );

      setTransactions(formattedTransactions);
    }
  } catch (error) {
    console.error("Error saving/updating transaction:", error);
    alert("Something went wrong while saving the transaction.");
  }
};

const clearForm = () => {
  setEditingTransactionId(null);
  setAccountId("");
  setCategoryId("");
  setSubcategoryId("");
  setSubcategories([]);
  setDescription("");
  setAmount("");
  setTransactionType("debit");
  setTransactionDate(new Date().toISOString().split("T")[0]);
};

const cancelEdit = () => {
  clearForm();
  setIsAddTransactionOpen(false);
};

const handleEditTransaction = async (transactionId) => {
  try {
    const token = getToken();

    const response = await fetch(
      `http://localhost:8080/api/transactions/${transactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || "Failed to load transaction"
      );
    }

    const transaction = await response.json();
    console.log("Transaction to edit:", transaction);

    // Set basic transaction fields
    setAccountId(String(transaction.accountId));
    setCategoryId(String(transaction.categoryId));
    setSubcategoryId(transaction.subcategoryId ? String(transaction.subcategoryId) : "");
    setEditingTransactionId(transactionId);
    setDescription(transaction.description || "");
    setAmount(transaction.amount.toString());
    setTransactionType(transaction.transactionType);
    setTransactionDate(transaction.transactionDate || "");
    // Open the Add/Edit transaction panel
    setIsAddTransactionOpen(true);

    // Load subcategories for selected category
    const subcategoryResponse = await fetch(
      `http://localhost:8080/api/subcategories/category/${transaction.categoryId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!subcategoryResponse.ok) {
      throw new Error("Failed to load subcategories");
    }

    const subcategoryData = await subcategoryResponse.json();

    setSubcategories(subcategoryData);

    // Find selected subcategory
    const selectedSubcategory = subcategoryData.find(
      (subcategory) =>
        subcategory.name === transaction.subcategory
    );

    if (selectedSubcategory) {
      setSubcategoryId(String(selectedSubcategory.id));
    } else {
      setSubcategoryId("");
    }

  } catch (error) {
    console.error(
      "Error loading transaction for edit:",
      error
    );

    alert(
      `Failed to load transaction: ${error.message}`
    );
  }
};

const handleDeleteTransaction = async (transactionId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const token = getToken();

    const response = await fetch(
      `http://localhost:8080/api/transactions/${transactionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to delete transaction.";

      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (error) {
        // Response may not contain JSON
      }

      console.error("Transaction delete failed:", errorMessage);
      alert(errorMessage);
      return;
    }

    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) => transaction.id !== transactionId
      )
    );

    alert("Transaction deleted successfully.");
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("Something went wrong while deleting the transaction.");
  }
};

const filteredTransactions = transactions.filter((transaction) => {
  const filterSearch = filterSearchTerm.toLowerCase().trim();
  const listSearch = listSearchTerm.toLowerCase().trim();

  const matchesType = transactionFilter === "all" || transaction.type?.toLowerCase() === transactionFilter;
  const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
  const matchesDate = (() => {
    if (dateFilter === "all") {
      return true;
    }
  const today = new Date();
  const [year, month, day] = transaction.date.split("-").map(Number);
  const transactionDate = new Date(year, month - 1, day);

  if (dateFilter === "today") {
    return (
      transactionDate.getFullYear() === today.getFullYear() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getDate() === today.getDate()
    );
  }
  if (dateFilter === "thisWeek") {
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();

    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
  }
  if (dateFilter === "thisMonth") {
    return (
      transactionDate.getFullYear() === today.getFullYear() &&
      transactionDate.getMonth() === today.getMonth()
    );
  }
  if (dateFilter === "lastMonth") {
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );
    lastMonthEnd.setHours(23, 59, 59, 999);
    return transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd;
  }
  if (dateFilter === "last3Months") {
    const threeMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 2,
      1
    );
    const endOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    endOfCurrentMonth.setHours(23, 59, 59, 999);
    return transactionDate >= threeMonthsAgo && transactionDate <= endOfCurrentMonth;
  }
  if (dateFilter === "thisYear") {
    return transactionDate.getFullYear() === today.getFullYear();
  }
  if (dateFilter === "custom") {
    const startDate = customStartDate ? new Date(`${customStartDate}T00:00:00`) : null;
    const endDate = customEndDate ? new Date(`${customEndDate}T23:59:59.999`) : null;
    if (startDate && endDate) {
      return transactionDate >= startDate && transactionDate <= endDate;
    }
    if (startDate) {
      return transactionDate >= startDate;
    }
    if (endDate) {
      return transactionDate <= endDate;
    }
    return true;
  }
  return true;
})();

  const matchesFilterSearch = !filterSearch ||
    transaction.description?.toLowerCase().includes(filterSearch) ||
    transaction.category?.toLowerCase().includes(filterSearch) ||
    transaction.subcategory?.toLowerCase().includes(filterSearch);

  const matchesListSearch = !listSearch ||
    transaction.description?.toLowerCase().includes(listSearch) ||
    transaction.category?.toLowerCase().includes(listSearch) ||
    transaction.subcategory?.toLowerCase().includes(listSearch);

  const matchesSearch = matchesFilterSearch && matchesListSearch;
  return matchesType && matchesCategory && matchesDate && matchesSearch;
});

const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedTransactions = filteredTransactions.slice(
  startIndex,
  startIndex + itemsPerPage
);

const clearFilters = () => {
  setDateFilter("thisMonth");
  setCustomStartDate("");
  setCustomEndDate("");
  setCategoryFilter("");
  setTransactionFilter("all");
  setFilterSearchTerm("");
  setListSearchTerm("");
  setCurrentPage(1);
  setIsDateFilterOpen(false);
};

useEffect(() => {
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

useEffect(() => {
  setCurrentPage(1);
}, [
  filterSearchTerm,
  listSearchTerm,
  transactionFilter,
  categoryFilter,
  dateFilter,
  customStartDate,
  customEndDate
]);

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

      <div className="date-filter-container">
        <button className="filter-select" type="button"
          onClick={() => setIsDateFilterOpen((current) => !current)}>
          <IconCalendar size={18} />
          <span>{dateFilter === "today" ? "Today" : dateFilter === "thisWeek"
                                        ? "This week" : dateFilter === "thisMonth"
                                        ? "This month" : dateFilter === "lastMonth"
                                        ? "Last month" : dateFilter === "last3Months"
                                        ? "Last 3 months" : dateFilter === "thisYear"
                                        ? "This year" : dateFilter === "custom"
                                        ? "Custom range" : "Date range"}</span>
          <IconChevronDown size={17} />
        </button>

        {isDateFilterOpen && ( 
          <div className="date-filter-dropdown">
            <button type="button" 
              onClick={() => {setDateFilter("today"); setIsDateFilterOpen(false);}}>Today</button>
            <button type="button"
              onClick={() => {setDateFilter("thisWeek"); setIsDateFilterOpen(false);}}>This week</button>
            <button type="button"
              onClick={() => {setDateFilter("thisMonth"); setIsDateFilterOpen(false);}}>This month</button>
            <button type="button"
              onClick={() => {setDateFilter("lastMonth"); setIsDateFilterOpen(false);}}>Last month</button>
            <button type="button"
              onClick={() => {setDateFilter("last3Months"); setIsDateFilterOpen(false);}}>Last 3 months</button>
            <button type="button"
              onClick={() => {setDateFilter("thisYear"); setIsDateFilterOpen(false);}}>This year</button>
            <div className="date-filter-divider"/>
              <button type="button"
                onClick={() => {setDateFilter("custom"); setIsDateFilterOpen(false);}}>Custom range...</button>
            </div>
          )}
        {dateFilter === "custom" && (
          <div className="custom-date-range">
            <div className="custom-date-field">
              <label>From</label>
              <input type="date" value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}/>
            </div>
            <div className="custom-date-field">
              <label>To</label>
              <input type="date" value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}/>
            </div>
             <button type="button" className="apply-date-button"
              onClick={() => setIsDateFilterOpen(false)}> Apply
            </button>
          </div>
        )}
      </div>

        <select className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select className="filter-select"
          value={transactionFilter}
          onChange={(e) => setTransactionFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
        </select>

        <div className="filter-search">
          <IconSearch size={18} />
          <input type="text" placeholder="Search..." value={filterSearchTerm}
                onChange={(e) => setFilterSearchTerm(e.target.value)}/>
        </div>

        <button type="button" className="clear-filters-button" 
            onClick={clearFilters}> Clear 
        </button>

        <div className="filter-actions">
          <button className="secondary-button">
            <IconDownload size={18} />
            Export
          </button>

          <button type="button" className="primary-button"
            onClick={() => {
              clearForm();
              setIsAddTransactionOpen(true);  
            }}>
            <IconPlus size={19} />
            Add transaction
          </button>
        </div>
      </div>

      {/* ADD TRANSACTION */}
      {isAddTransactionOpen && (
      <div className="add-transaction-card">
        <div className="add-transaction-header">
          <div className="add-title">
            <div className="add-icon">
              <IconPencil size={20} />
            </div>
            <h2>{editingTransactionId ? "Edit transaction" : "Add new transaction"}</h2>
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
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="form-field">
            <label>Account</label>
            <select value={accountId}
              onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Select account</option>
               {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName}
                </option>
            ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="form-field">
            <label>Description</label>

            <input
              type="text"
              placeholder="e.g. Swiggy order"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* CATEGORY */}
          <div className="form-field">
            <label>Category</label>

            <select value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}>
              <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            </select>
          </div>

          {/* SUBCATEGORY */}
          <div className="form-field">
            <label>Subcategory</label>

             <select value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}>
    
              <option value=""> 
                  {categoryId ? "Select subcategory" : "Select category first"}
              </option>

              {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
              ))}
            </select>
          </div>

          {/* AMOUNT */}
          <div className="form-field">
            <label>Amount (₹)</label>

            <input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
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
            <button type="button" className="clear-button" onClick={clearForm}>
              Clear
            </button>

          <div className="transaction-form-actions">
            <button className="save-button"
              onClick={saveTransaction}>
              {editingTransactionId ? "Update transaction" : "Save transaction"}
            </button>
            {editingTransactionId && (<button type="button" className="transaction-cancel-button"
              onClick={cancelEdit}>
             Cancel
          </button>
          )}
          </div>
          </div>

        </div>
      </div>
      )}

      {/* TRANSACTIONS LIST */}
      <div className="transactions-list-card">

        {/* LIST HEADER */}
        <div className="transactions-list-header">

          <div>
            <h2>Transactions list</h2>

            <div className="transaction-tabs">
              <button className={`transaction-tab ${
                  transactionFilter === "all" ? "active" : ""
              }`}
              onClick={() => setTransactionFilter("all")}>
                All
              </button>

              <button className={`transaction-tab ${
                  transactionFilter === "debit" ? "active" : ""
              }`}
              onClick={() => setTransactionFilter("debit")}>
                Debit
              </button>

              <button className={`transaction-tab ${
                  transactionFilter === "credit" ? "active" : ""
              }`}
              onClick={() => setTransactionFilter("credit")}>
                Credit
              </button>
            </div>
          </div>

          <div className="list-header-right">

            <div className="list-search">
              <IconSearch size={18} />
              <input type="text"  placeholder="Search in transactions..."
                 value={listSearchTerm} onChange={(e) => setListSearchTerm(e.target.value)}/>
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
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="transactions-empty-state">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td> <input type="checkbox" /> </td>
                    <td className="date-cell"> {transaction.date} </td>
                    <td className="description-cell">
                      <div className="transaction-description">
                        <div className={`transaction-symbol ${transaction.categoryClass}`}>
                          {transaction.type === "Credit" ? (<IconArrowUp size={17} />) : (<IconArrowDown size={17} /> )}
                        </div>
                        <span> {transaction.description} </span>
                      </div>
                    </td>
                    <td> <span className={`category-tag ${transaction.categoryClass}`}>
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
                    <div className="transaction-actions">
                      <button type="button" className="row-action"
                        onClick={() => handleEditTransaction(transaction.id)}
                        title="Edit transaction">
                        <IconPencil size={19} />
                      </button>

                      <button type="button" className="row-action"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        title="Delete transaction">
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

        {/* PAGINATION */}
        <div className="transactions-pagination">

          <span>
            Showing{" "}
            {filteredTransactions.length === 0 ? 0 : startIndex + 1}{" "}
            to{" "}
            {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}{" "}
            of {filteredTransactions.length} transactions
          </span>

          <div className="pagination-buttons">

            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}>
              <IconChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button key={page} className={currentPage === page ? "current-page" : ""}
                onClick={() => setCurrentPage(page)}>
              {page}
            </button>
            )
          )}

          <button onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}>
              <IconChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default TransactionPage;