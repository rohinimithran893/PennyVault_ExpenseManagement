import React, { useEffect, useRef, useState } from "react";
import { getToken } from "../utils/auth";
import { exportTransactionsCsv, exportTransactionsXlsx } from "../utils/transactionExport";
import "../Styles/Transactions.css";
import AdvancedFilters from "./Transactions/AdvancedFilters";
import TransactionTable from "./Transactions/TransactionTable";
import TransactionForm from "./Transactions/TransactionForm";
import TransactionOverlays from "./Transactions/TransactionOverlays";
import TransactionToolbar from "./Transactions/TransactionToolbar";
import TransactionHeader from "./Transactions/TransactionHeader";
import TransactionSummaryCards from "./Transactions/TransactionSummaryCards";
import {
  IconCheck,
  IconAlertCircle,
  IconX,
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

const formatTransactionAmount = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "₹0.00";
  }

  return `₹${numericAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatTransactionDate = (date) => {
  if (!date) {
    return "-";
  }

  const [year, month, day] = String(date).split("-").map(Number);

  if (!year || !month || !day) {
    return date;
  }

  const formattedDate = new Date(year, month - 1, day);

  if (Number.isNaN(formattedDate.getTime())) {
    return date;
  }

  return formattedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
    new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Show the newest transaction dates first by default.
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [draftTransactionFilter, setDraftTransactionFilter] = useState("all");
  const [draftCategoryFilter, setDraftCategoryFilter] = useState("");
  const [draftDateFilter, setDraftDateFilter] = useState("thisMonth");
  const [draftCustomStartDate, setDraftCustomStartDate] = useState("");
  const [draftCustomEndDate, setDraftCustomEndDate] = useState("");
  const [draftMinAmount, setDraftMinAmount] = useState("");
  const [draftMaxAmount, setDraftMaxAmount] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const deleteInProgressRef = useRef(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const saveInProgressRef = useRef(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const itemsPerPage = 5;

  const openAdvancedFilters = () => {
    setDraftTransactionFilter(transactionFilter);
    setDraftCategoryFilter(categoryFilter);
    setDraftDateFilter(dateFilter);
    setDraftCustomStartDate(customStartDate);
    setDraftCustomEndDate(customEndDate);
    setDraftMinAmount(minAmount);
    setDraftMaxAmount(maxAmount);
    setIsAdvancedFilterOpen(true);
  };

  const applyAdvancedFilters = () => {
    setTransactionFilter(draftTransactionFilter);
    setCategoryFilter(draftCategoryFilter);
    setDateFilter(draftDateFilter);
    setCustomStartDate(draftCustomStartDate);
    setCustomEndDate(draftCustomEndDate);
    setMinAmount(draftMinAmount);
    setMaxAmount(draftMaxAmount);
    setCurrentPage(1);
    setIsAdvancedFilterOpen(false);
  };

  const cancelAdvancedFilters = () => {
    setIsAdvancedFilterOpen(false);
  };

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      id: Date.now(),
      message,
      type,
    });

    toastTimerRef.current = setTimeout(
      () => {
        setToast(null);
      },
      type === "error" ? 5000 : 3500,
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isExportMenuOpen) {
      return undefined;
    }

    const closeExportMenu = (event) => {
      if (event.type === "keydown" && event.key === "Escape") {
        setIsExportMenuOpen(false);
      } else if (
        event.type === "mousedown" &&
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeExportMenu);
    document.addEventListener("keydown", closeExportMenu);
    return () => {
      document.removeEventListener("mousedown", closeExportMenu);
      document.removeEventListener("keydown", closeExportMenu);
    };
  }, [isExportMenuOpen]);

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
        });

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
          },
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

  const loadTransactions = async () => {
    setIsTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const token = getToken();

      const response = await fetch("http://localhost:8080/api/transactions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMessage = "Failed to load transactions.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (error) {
          // Keep the default error message.
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();

      const formattedTransactions = data.map((transaction) => ({
        id: transaction.id,
        date: transaction.transactionDate,
        description: transaction.description,
        accountId: transaction.accountId ?? transaction.account?.id ?? "",
        accountName:
          transaction.accountName ?? transaction.account?.accountName ?? transaction.account?.name ?? "",
        category: transaction.category,
        categoryClass: getCategoryClass(transaction.category),
        subcategory: transaction.subcategory,
        paidBy: "R",
        amount: Number(transaction.amount),
        type:
          transaction.transactionType?.toLowerCase() === "income"
            ? "Credit"
            : "Debit",
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactionsError(
        "We couldn't load your transactions right now. Please try again.",
      );
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSort = (key) => {
    setCurrentPage(1);

    setSortConfig((currentSort) => {
      // Date starts descending by default; the first click switches to ascending.
      if (currentSort.key === key && key === "date") {
        return {
          key,
          direction: currentSort.direction === "desc" ? "asc" : "desc",
        };
      }

      if (currentSort.key !== key) {
        return {
          key,
          direction: "asc",
        };
      }

      if (currentSort.direction === "asc") {
        return {
          key,
          direction: "desc",
        };
      }

      // Resetting another column's sort returns to newest date first.
      return {
        key: "date",
        direction: "desc",
      };
    });
  };
  const validateTransactionForm = () => {
    const errors = {};
    if (!transactionDate) {
      errors.transactionDate = "Date is required.";
    } else {
      const selectedDate = new Date(`${transactionDate}T00:00:00`);
      if (Number.isNaN(selectedDate.getTime())) {
        errors.transactionDate = "Please enter a valid date.";
      }
    }
    if (!accountId) {
      errors.accountId = "Please select an account.";
    }
    if (!categoryId) {
      errors.categoryId = "Please select a category.";
    }
    if (!subcategoryId) {
      errors.subcategoryId = "Please select a subcategory.";
    }
    if (!description.trim()) {
      errors.description = "Description is required.";
    }
    const numericAmount = Number(amount);
    if (!amount || amount.trim() === "") {
      errors.amount = "Amount is required.";
    } else if (!Number.isFinite(numericAmount)) {
      errors.amount = "Please enter a valid amount.";
    } else if (numericAmount <= 0) {
      errors.amount = "Amount must be greater than 0.";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast("Please correct the highlighted fields.", "error");
      return false;
    }
    return true;
  };

  const saveTransaction = async () => {
    // Prevent repeated submissions before React has a chance to re-render.
    if (saveInProgressRef.current) {
      return;
    }

    if (!validateTransactionForm()) {
      return;
    }

    saveInProgressRef.current = true;
    setIsSavingTransaction(true);

    try {
      const token = getToken();
      const transactionData = {
        accountId: Number(accountId),
        categoryId: Number(categoryId),
        subcategoryId: Number(subcategoryId),
        description: description.trim(),
        amount: Number(amount),
        transactionType: transactionType === "debit" ? "EXPENSE" : "INCOME",
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
        showToast(data.message || "Failed to save transaction.", "error");
        return;
      }

      console.log(
        isEditing
          ? "Transaction updated successfully:"
          : "Transaction created successfully:",
        data,
      );

      if (isEditing) {
        showToast("Transaction updated successfully.", "success");
      } else {
        showToast("Transaction saved successfully.", "success");
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
        },
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();

        const formattedTransactions = transactionsData.map((transaction) => ({
          id: transaction.id,
          date: transaction.transactionDate,
          description: transaction.description,
          accountId: transaction.accountId ?? transaction.account?.id ?? "",
          accountName:
            transaction.accountName ?? transaction.account?.accountName ?? transaction.account?.name ?? "",
          category: transaction.category,
          categoryClass: getCategoryClass(transaction.category),
          subcategory: transaction.subcategory,
          paidBy: "R",
          amount: Number(transaction.amount),
          type:
            transaction.transactionType?.toLowerCase() === "income"
              ? "Credit"
              : "Debit",
        }));

        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error saving/updating transaction:", error);
      showToast("Something went wrong while saving the transaction.", "error");
    } finally {
      saveInProgressRef.current = false;
      setIsSavingTransaction(false);
    }
  };

  const resetTransactionFields = () => {
    setAccountId("");
    setCategoryId("");
    setSubcategoryId("");
    setSubcategories([]);
    setDescription("");
    setAmount("");
    setTransactionType("debit");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setFormErrors({});
  };

  // Reset the form completely when starting a new transaction or after saving.
  const clearForm = () => {
    setEditingTransactionId(null);
    resetTransactionFields();
  };

  const cancelEdit = () => {
    clearForm();
    setIsAddTransactionOpen(false);
  };

  const handleViewTransaction = async (transactionId) => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8080/api/transactions/${transactionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load transaction");
      }
      const transaction = await response.json();
      setViewingTransaction(transaction);
    } catch (error) {
      console.error("Error loading transaction details:", error);
      showToast(`Failed to load transaction: ${error.message}`, "error");
    }
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
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load transaction");
      }

      const transaction = await response.json();
      console.log("Transaction to edit:", transaction);

      // Set basic transaction fields
      setAccountId(String(transaction.accountId));
      setCategoryId(String(transaction.categoryId));
      setSubcategoryId(
        transaction.subcategoryId ? String(transaction.subcategoryId) : "",
      );
      setEditingTransactionId(transactionId);
      setDescription(transaction.description || "");
      setAmount(transaction.amount.toString());
      setTransactionType(
        transaction.transactionType?.toLowerCase() === "income"
          ? "credit"
          : "debit",
      );
      setTransactionDate(transaction.transactionDate || "");
      setViewingTransaction(null);
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
        },
      );

      if (!subcategoryResponse.ok) {
        throw new Error("Failed to load subcategories");
      }

      const subcategoryData = await subcategoryResponse.json();

      setSubcategories(subcategoryData);

      // Find selected subcategory
      const selectedSubcategory = subcategoryData.find(
        (subcategory) => subcategory.name === transaction.subcategory,
      );

      if (selectedSubcategory) {
        setSubcategoryId(String(selectedSubcategory.id));
      } else {
        setSubcategoryId("");
      }
    } catch (error) {
      console.error("Error loading transaction for edit:", error);

      showToast(`Failed to load transaction: ${error.message}`, "error");
    }
  };

  const handleDeleteTransaction = (transaction) => {
    setDeleteTarget(transaction);
  };

  const confirmDeleteTransaction = async () => {
    if (!deleteTarget || deleteInProgressRef.current) {
      return;
    }

    deleteInProgressRef.current = true;
    setIsDeletingTransaction(true);
    const transactionId = deleteTarget.id;

    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8080/api/transactions/${transactionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        let errorMessage = "Failed to delete transaction.";
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (error) {
          // Response may not contain JSON.
        }

        console.error("Transaction delete failed:", errorMessage);
        showToast(errorMessage, "error");
        return;
      }

      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transactionItem) => String(transactionItem.id) !== String(transactionId),
        ),
      );
      setDeleteTarget(null);
      showToast("Transaction deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showToast(
        "Something went wrong while deleting the transaction. Please try again.",
        "error",
      );
    } finally {
      deleteInProgressRef.current = false;
      setIsDeletingTransaction(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const searchTerm = filterSearchTerm.toLowerCase().trim();

    const matchesType =
      transactionFilter === "all" ||
      transaction.type?.toLowerCase() === transactionFilter;
    const matchesCategory =
      !categoryFilter || transaction.category === categoryFilter;
    const transactionAmount = Number(transaction.amount);
    const matchesAmount =
      (!minAmount ||
        (Number.isFinite(transactionAmount) &&
          transactionAmount >= Number(minAmount))) &&
      (!maxAmount ||
        (Number.isFinite(transactionAmount) &&
          transactionAmount <= Number(maxAmount)));
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
          1,
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        return (
          transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd
        );
      }
      if (dateFilter === "last3Months") {
        const threeMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 2,
          1,
        );
        const endOfCurrentMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        endOfCurrentMonth.setHours(23, 59, 59, 999);
        return (
          transactionDate >= threeMonthsAgo &&
          transactionDate <= endOfCurrentMonth
        );
      }
      if (dateFilter === "thisYear") {
        return transactionDate.getFullYear() === today.getFullYear();
      }
      if (dateFilter === "custom") {
        const startDate = customStartDate
          ? new Date(`${customStartDate}T00:00:00`)
          : null;
        const endDate = customEndDate
          ? new Date(`${customEndDate}T23:59:59.999`)
          : null;
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

    const matchingAccount = accounts.find(
      (account) => String(account.id) === String(transaction.accountId),
    );
    const searchableAccount =
      transaction.accountName ||
      matchingAccount?.accountName ||
      matchingAccount?.name ||
      "";
    const matchesSearch =
      !searchTerm ||
      transaction.description?.toLowerCase().includes(searchTerm) ||
      transaction.category?.toLowerCase().includes(searchTerm) ||
      transaction.subcategory?.toLowerCase().includes(searchTerm) ||
      String(searchableAccount).toLowerCase().includes(searchTerm);
    return (
      matchesType &&
      matchesCategory &&
      matchesDate &&
      matchesAmount &&
      matchesSearch
    );
  });

  const totalIncome = filteredTransactions.reduce((total, transaction) => {
    return transaction.type?.toLowerCase() === "credit"
      ? total + (Number(transaction.amount) || 0)
      : total;
  }, 0);
  const totalExpenses = filteredTransactions.reduce((total, transaction) => {
    return transaction.type?.toLowerCase() === "debit"
      ? total + (Number(transaction.amount) || 0)
      : total;
  }, 0);
  const transactionAmount = totalIncome + totalExpenses;
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.key) {
      case "date":
        comparison = String(a.date || "").localeCompare(String(b.date || ""));
        // If dates match, use the larger/newer transaction ID first when possible.
        if (comparison === 0) {
          const idA = Number(a.id);
          const idB = Number(b.id);
          comparison =
            Number.isFinite(idA) && Number.isFinite(idB)
              ? idA - idB
              : String(a.id || "").localeCompare(String(b.id || ""));
        }
        break;

      case "description":
        comparison = String(a.description || "").localeCompare(
          String(b.description || ""),
          undefined,
          { sensitivity: "base" },
        );
        break;

      case "category":
        comparison = String(a.category || "").localeCompare(
          String(b.category || ""),
          undefined,
          { sensitivity: "base" },
        );
        break;

      case "amount": {
        const amountA = Number(String(a.amount || "").replace(/[₹,\s]/g, ""));

        const amountB = Number(String(b.amount || "").replace(/[₹,\s]/g, ""));

        comparison = amountA - amountB;
        break;
      }

      case "type":
        comparison = String(a.type || "").localeCompare(
          String(b.type || ""),
          undefined,
          { sensitivity: "base" },
        );
        break;

      default:
        comparison = 0;
    }

    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  const exportTransactions = (format) => {
    setIsExportMenuOpen(false);

    if (sortedTransactions.length === 0) {
      showToast("No transactions to export. Adjust your search or filters.", "error");
      return;
    }

    const now = new Date();
    const exportDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    const filename = `PennyVault_Transactions_${exportDate}.${format}`;

    if (format === "csv") {
      exportTransactionsCsv(sortedTransactions, accounts, filename);
    } else {
      exportTransactionsXlsx(sortedTransactions, accounts, filename);
    }

    showToast(
      `Exported ${sortedTransactions.length} transaction${sortedTransactions.length === 1 ? "" : "s"} as ${format.toUpperCase()}.`,
      "success",
    );
  };

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedTransactions = sortedTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-left",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  };

  const paginationItems = getPaginationItems();

  const resetDateFilter = () => {
    setDateFilter("thisMonth");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const clearFilters = () => {
    resetDateFilter();
    setCategoryFilter("");
    setMinAmount("");
    setMaxAmount("");
    setTransactionFilter("all");
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setFilterSearchTerm(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setFilterSearchTerm("");
    setCurrentPage(1);
  };

  const clearAll = () => {
    clearFilters();
    clearSearch();
  };

  const removeActiveFilter = (filterKey) => {
    switch (filterKey) {
      case "type":
        setTransactionFilter("all");
        break;
      case "category":
        setCategoryFilter("");
        break;
      case "date":
        resetDateFilter();
        break;
      case "minAmount":
        setMinAmount("");
        break;
      case "maxAmount":
        setMaxAmount("");
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const dateFilterLabels = {
    all: "All time",
    today: "Today",
    thisWeek: "This week",
    thisMonth: "This month",
    lastMonth: "Last month",
    last3Months: "Last 3 months",
    thisYear: "This year",
    custom: "Custom date range",
  };

  const activeFilterChips = [
    ...(transactionFilter !== "all"
      ? [{ key: "type", label: `Type: ${transactionFilter === "debit" ? "Debit" : "Credit"}` }]
      : []),
    ...(categoryFilter
      ? [{ key: "category", label: `Category: ${categoryFilter}` }]
      : []),
    ...(dateFilter !== "thisMonth"
      ? [{
          key: "date",
          label: dateFilter === "custom"
            ? `Date: ${customStartDate || "Any"} – ${customEndDate || "Any"}`
            : `Date: ${dateFilterLabels[dateFilter] || dateFilter}`,
        }]
      : []),
    ...(minAmount
      ? [{ key: "minAmount", label: `Min: ₹${Number(minAmount).toLocaleString("en-IN")}` }]
      : []),
    ...(maxAmount
      ? [{ key: "maxAmount", label: `Max: ₹${Number(maxAmount).toLocaleString("en-IN")}` }]
      : []),
  ];

  const hasSearch = Boolean(filterSearchTerm.trim());

  const hasActiveFilters = activeFilterChips.length > 0;

  const getEmptyState = () => {
    // 1. User genuinely has no transactions
    if (transactions.length === 0) {
      return {
        type: "no-transactions",
        icon: "wallet",
        title: "No transactions yet",
        message:
          "Start tracking your spending by adding your first transaction.",
      };
    }

    // 4. Search + filters are active but nothing matches
    if (hasSearch && hasActiveFilters) {
      return {
        type: "search-and-filter",
        icon: "search",
        title: "No matching transactions",
        message: "No transactions match your current search and filters.",
      };
    }

    // 2. Search is active but nothing matches
    if (hasSearch) {
      return {
        type: "search",
        icon: "search",
        title: "No transactions found",
        message: "We couldn't find anything matching your search.",
      };
    }

    // 3. Filters are active but nothing matches
    if (hasActiveFilters) {
      return {
        type: "filters",
        icon: "filter",
        title: "No matching transactions",
        message: "No transactions match your current filters.",
      };
    }

    return {
      type: "no-transactions",
      icon: "wallet",
      title: "No transactions yet",
      message: "Start tracking your spending by adding your first transaction.",
    };
  };

  const emptyState = getEmptyState();

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterSearchTerm,
    transactionFilter,
    categoryFilter,
    dateFilter,
    customStartDate,
    customEndDate,
    minAmount,
    maxAmount,
  ]);

  return (
    <div className="transactions-page">
      {toast && (
        <div
          className={`transaction-toast ${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="transaction-toast-icon">
            {toast.type === "success" ? (
              <IconCheck size={18} />
            ) : (
              <IconAlertCircle size={18} />
            )}
          </div>

          <span className="transaction-toast-message">{toast.message}</span>

          <button
            type="button"
            className="transaction-toast-close"
            onClick={() => {
              if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
              }

              setToast(null);
            }}
            aria-label="Close notification"
          >
            <IconX size={17} />
          </button>
        </div>
      )}

      <AdvancedFilters
        isOpen={isAdvancedFilterOpen}
        draftTransactionFilter={draftTransactionFilter}
        setDraftTransactionFilter={setDraftTransactionFilter}
        draftCategoryFilter={draftCategoryFilter}
        setDraftCategoryFilter={setDraftCategoryFilter}
        categories={categories}
        draftDateFilter={draftDateFilter}
        setDraftDateFilter={setDraftDateFilter}
        draftCustomStartDate={draftCustomStartDate}
        setDraftCustomStartDate={setDraftCustomStartDate}
        draftCustomEndDate={draftCustomEndDate}
        setDraftCustomEndDate={setDraftCustomEndDate}
        draftMinAmount={draftMinAmount}
        setDraftMinAmount={setDraftMinAmount}
        draftMaxAmount={draftMaxAmount}
        setDraftMaxAmount={setDraftMaxAmount}
        setIsAdvancedFilterOpen={setIsAdvancedFilterOpen}
        applyAdvancedFilters={applyAdvancedFilters}
      />

      {/* PAGE HEADER */}
      <TransactionHeader
        onAddTransaction={() => {
          clearForm();
          setViewingTransaction(null);
          setIsAddTransactionOpen(true);
        }}
      />

      <TransactionSummaryCards
        transactionAmount={transactionAmount}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        filteredTransactions={filteredTransactions}
        formatTransactionAmount={formatTransactionAmount}
      />
      <TransactionToolbar
        filterSearchTerm={filterSearchTerm}
        handleSearchChange={handleSearchChange}
        hasActiveFilters={hasActiveFilters}
        activeFilterChips={activeFilterChips}
        openAdvancedFilters={openAdvancedFilters}
        clearAll={clearAll}
        exportMenuRef={exportMenuRef}
        isExportMenuOpen={isExportMenuOpen}
        setIsExportMenuOpen={setIsExportMenuOpen}
        exportTransactions={exportTransactions}
        removeActiveFilter={removeActiveFilter}
        clearFilters={clearFilters}
      />

      {/* ADD TRANSACTION */}
      <TransactionForm
        isAddTransactionOpen={isAddTransactionOpen}
        editingTransactionId={editingTransactionId}
        transactionDate={transactionDate}
        setTransactionDate={setTransactionDate}
        accountId={accountId}
        setAccountId={setAccountId}
        accounts={accounts}
        description={description}
        setDescription={setDescription}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        subcategoryId={subcategoryId}
        setSubcategoryId={setSubcategoryId}
        subcategories={subcategories}
        amount={amount}
        setAmount={setAmount}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        clearForm={resetTransactionFields}
        saveTransaction={saveTransaction}
        isSavingTransaction={isSavingTransaction}
        cancelEdit={cancelEdit}
      />

      {/* TRANSACTION OVERLAYS */}
      <TransactionOverlays
        viewingTransaction={viewingTransaction}
        setViewingTransaction={setViewingTransaction}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        isDeletingTransaction={isDeletingTransaction}
        accounts={accounts}
        getCategoryClass={getCategoryClass}
        formatTransactionDate={formatTransactionDate}
        handleEditTransaction={handleEditTransaction}
        confirmDeleteTransaction={confirmDeleteTransaction}
      />

      {/* TRANSACTIONS LIST */}
      <TransactionTable
        sortConfig={sortConfig}
        handleSort={handleSort}
        isTransactionsLoading={isTransactionsLoading}
        transactionsError={transactionsError}
        paginatedTransactions={paginatedTransactions}
        emptyState={emptyState}
        clearForm={clearForm}
        setEditingTransactionId={setEditingTransactionId}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
        clearSearch={clearSearch}
        clearFilters={clearFilters}
        formatTransactionDate={formatTransactionDate}
        formatTransactionAmount={formatTransactionAmount}
        handleViewTransaction={handleViewTransaction}
        handleEditTransaction={handleEditTransaction}
        handleDeleteTransaction={handleDeleteTransaction}
        filteredTransactions={filteredTransactions}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        paginationItems={paginationItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        loadTransactions={loadTransactions}
      />
    </div>
  );
}

export default TransactionPage;
