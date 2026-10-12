import React, { useEffect, useState } from "react";
import {
  IconAlertTriangle,
  IconCalendar,
  IconClock,
  IconPackage,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { getUser } from "../utils/auth";
import { apiRequest } from "../services/apiClient";
import {
  getCategoryBudgetLimit,
  getSubcategoryBudgetLimit,
  readBudgetPlan,
} from "../utils/budgetConfig";
import "../Styles/HomeEssentials.css";

const CATEGORIES = [
  "Groceries",
  "Personal care",
  "Cleaning",
  "Medicine",
  "Baby care",
  "Kitchen",
  "Home supplies",
  "Electronics",
  "Other",
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStorageKey = () => {
  const user = getUser();
  const identity =
    user?.id ??
    user?.userId ??
    user?.email ??
    user?.username ??
    user?.fullName ??
    "personal";
  const safeIdentity = String(identity)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_");

  return `pennyvault:home-essentials:${safeIdentity}`;
};

const readInventory = (storageKey) => {
  try {
    const savedItems = window.localStorage.getItem(storageKey);
    const parsedItems = savedItems ? JSON.parse(savedItems) : [];
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    return [];
  }
};

const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "—";
  return `₹${numericAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeName = (value) => String(value ?? "").trim().toLowerCase();

const getBudgetDetails = (item, budgetPlan, transactions, today) => {
  if (!item?.financeCategoryId || !item?.financeSubcategoryId) return null;

  const categoryLimit = getCategoryBudgetLimit(
    budgetPlan,
    item.financeCategoryId,
    item.financeCategoryName,
  );
  const subcategoryLimit = getSubcategoryBudgetLimit(
    budgetPlan,
    item.financeSubcategoryId,
    item.financeSubcategoryName,
  );
  const currentMonth = today.slice(0, 7);
  const currentMonthExpenses = (transactions || []).filter((transaction) => {
    const date = String(transaction.transactionDate ?? transaction.date ?? "");
    const type = String(transaction.transactionType ?? transaction.type ?? "").toUpperCase();
    return date.slice(0, 7) === currentMonth &&
      (type === "EXPENSE" || type === "DEBIT");
  });

  const categoryTransactions = currentMonthExpenses.filter((transaction) =>
    transaction.categoryId != null
      ? String(transaction.categoryId) === String(item.financeCategoryId)
      : normalizeName(transaction.category) === normalizeName(item.financeCategoryName)
  );
  const subcategoryTransactions = categoryTransactions.filter((transaction) =>
    transaction.subcategoryId != null
      ? String(transaction.subcategoryId) === String(item.financeSubcategoryId)
      : normalizeName(transaction.subcategory) === normalizeName(item.financeSubcategoryName)
  );
  const categorySpent = categoryTransactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) || 0),
    0,
  );
  const subcategorySpent = subcategoryTransactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) || 0),
    0,
  );
  const categoryRemaining = categoryLimit - categorySpent;
  const subcategoryRemaining = subcategoryLimit - subcategorySpent;

  if (subcategoryLimit > 0) {
    return {
      label: subcategoryRemaining < 0
        ? "Over subcategory budget"
        : `${formatCurrency(subcategoryRemaining)} left`,
      remaining: subcategoryRemaining,
      categoryLimit,
      categorySpent,
      categoryRemaining,
      subcategoryLimit,
      subcategorySpent,
      subcategoryRemaining,
    };
  }

  if (categoryLimit > 0) {
    return {
      label: categoryRemaining < 0
        ? "Over category budget"
        : `${formatCurrency(categoryRemaining)} left`,
      remaining: categoryRemaining,
      categoryLimit,
      categorySpent,
      categoryRemaining,
      subcategoryLimit,
      subcategorySpent,
      subcategoryRemaining,
    };
  }

  return {
    label: "No budget set",
    remaining: 0,
    categoryLimit,
    categorySpent,
    categoryRemaining,
    subcategoryLimit,
    subcategorySpent,
    subcategoryRemaining,
  };
};

const formatDate = (date) => {
  if (!date) return "—";

  const [year, month, day] = String(date).split("-").map(Number);
  if (!year || !month || !day) return date;

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return { key: "none", label: "No expiry date" };
  }

  const today = getToday();
  if (expiryDate < today) {
    return { key: "expired", label: "Expired" };
  }

  const todayTime = new Date(`${today}T00:00:00`).getTime();
  const expiryTime = new Date(`${expiryDate}T00:00:00`).getTime();
  const daysRemaining = Math.round(
    (expiryTime - todayTime) / (24 * 60 * 60 * 1000),
  );

  if (daysRemaining <= 30) {
    return { key: "soon", label: "Expiring soon" };
  }

  return { key: "valid", label: "In stock" };
};

const createEmptyForm = () => ({
  productName: "",
  category: "Groceries",
  quantity: "",
  purchasedDate: getToday(),
  expiryDate: "",
  notes: "",
  purchaseAmount: "",
  accountId: "",
  financeCategoryId: "",
  financeSubcategoryId: "",
});

function HomeEssentials() {
  const storageKey = getStorageKey();
  const [items, setItems] = useState(() => readInventory(storageKey));
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm);
  const [formError, setFormError] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [financeCategories, setFinanceCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetPlan] = useState(readBudgetPlan);
  const [isSavingItem, setIsSavingItem] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadFinanceReferenceData = async () => {
      const loadList = async (endpoint) => {
        try {
          const response = await apiRequest(endpoint);
          if (!response.ok) return [];
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error(`Unable to load ${endpoint}:`, error);
          return [];
        }
      };

      const [accountData, categoryData, transactionData] = await Promise.all([
        loadList("/accounts"),
        loadList("/categories"),
        loadList("/transactions"),
      ]);
      if (!isMounted) return;
      setAccounts(accountData);
      setFinanceCategories(categoryData);
      setTransactions(transactionData);
    };
    loadFinanceReferenceData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadSubcategories = async () => {
      if (!formData.financeCategoryId) {
        setSubcategories([]);
        return;
      }
      try {
        const response = await apiRequest(
          `/subcategories/category/${formData.financeCategoryId}`
        );
        if (!response.ok) throw new Error("Unable to load subcategories.");
        const data = await response.json();
        if (isMounted) setSubcategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Unable to load transaction subcategories:", error);
        if (isMounted) setSubcategories([]);
      }
    };
    loadSubcategories();
    return () => { isMounted = false; };
  }, [formData.financeCategoryId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Keep the page usable if browser storage is unavailable or full.
    }
  }, [items, storageKey]);

  const expiringSoonCount = items.filter(
    (item) => getExpiryStatus(item.expiryDate).key === "soon",
  ).length;
  const expiredCount = items.filter(
    (item) => getExpiryStatus(item.expiryDate).key === "expired",
  ).length;
  const validCount = items.length - expiredCount;

  const filteredItems = items.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [item.productName, item.category, item.quantity, item.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const status = getExpiryStatus(item.expiryDate).key;
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const openAddForm = () => {
    setEditingItemId(null);
    setFormData(createEmptyForm());
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItemId(item.id);
    setFormData({
      productName: item.productName || "",
      category: item.category || "Other",
      quantity: item.quantity || "",
      purchasedDate: item.purchasedDate || getToday(),
      expiryDate: item.expiryDate || "",
      notes: item.notes || "",
      purchaseAmount: item.purchaseAmount ?? "",
      accountId: item.accountId ?? "",
      financeCategoryId: item.financeCategoryId ?? "",
      financeSubcategoryId: item.financeSubcategoryId ?? "",
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItemId(null);
    setFormData(createEmptyForm());
    setFormError("");
  };

  const updateFormField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSavingItem) return;
    if (!formData.productName.trim()) {
      setFormError("Enter the product name.");
      return;
    }
    if (!formData.quantity.trim()) {
      setFormError("Enter a quantity, including its unit where useful.");
      return;
    }
    if (!formData.purchasedDate) {
      setFormError("Choose the purchased date.");
      return;
    }

    const amountText = String(formData.purchaseAmount ?? "").trim();
    const purchaseAmount = amountText === "" ? null : Number(amountText);
    const alreadyLinked = items.some(
      (item) => item.id === editingItemId && item.transactionId
    );
    if (alreadyLinked && purchaseAmount === null) {
      setFormError("This item already has a linked expense. Enter its amount to keep or update the linked transaction. Deleting the inventory item will not delete the transaction.");
      return;
    }
    if (amountText !== "" && (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0)) {
      setFormError("Purchase amount must be greater than zero.");
      return;
    }
    if (purchaseAmount !== null &&
        (!formData.accountId || !formData.financeCategoryId || !formData.financeSubcategoryId)) {
      setFormError("To send the purchase to Transactions and Budgets, choose an account, expense category, and subcategory.");
      return;
    }

    setIsSavingItem(true);
    setFormError("");
    try {
      const existingItem = items.find((item) => item.id === editingItemId);
      let linkedPurchase = existingItem?.transactionId
        ? {
            transactionId: existingItem.transactionId,
            purchaseAmount: existingItem.purchaseAmount,
            accountId: existingItem.accountId ?? "",
            financeCategoryId: existingItem.financeCategoryId ?? "",
            financeSubcategoryId: existingItem.financeSubcategoryId ?? "",
            financeCategoryName: existingItem.financeCategoryName ?? "",
            financeSubcategoryName: existingItem.financeSubcategoryName ?? "",
          }
        : {};

      if (purchaseAmount !== null) {
        const category = financeCategories.find(
          (entry) => String(entry.id) === String(formData.financeCategoryId)
        );
        const subcategory = subcategories.find(
          (entry) => String(entry.id) === String(formData.financeSubcategoryId)
        );
        if (!category || !subcategory) {
          setFormError("The selected finance category or subcategory is no longer available. Refresh the page and try again.");
          return;
        }

        const transactionPayload = {
          accountId: Number(formData.accountId),
          categoryId: Number(formData.financeCategoryId),
          subcategoryId: Number(formData.financeSubcategoryId),
          description: `${formData.productName.trim()} purchase`,
          amount: purchaseAmount,
          transactionType: "EXPENSE",
          transactionDate: formData.purchasedDate,
        };
        const method = existingItem?.transactionId ? "PUT" : "POST";
        const endpoint = existingItem?.transactionId
          ? `/transactions/${existingItem.transactionId}`
          : "/transactions";
        const response = await apiRequest(endpoint, {
          method,
          body: JSON.stringify(transactionPayload),
        });
        const responseData = await response.json().catch(() => ({}));
        if (!response.ok) {
          setFormError(
            responseData.message ||
            responseData.error ||
            "The purchase could not be saved as a transaction. Your inventory item was not changed."
          );
          return;
        }

        linkedPurchase = {
          transactionId: responseData.id ?? existingItem?.transactionId ?? null,
          purchaseAmount,
          accountId: String(formData.accountId),
          financeCategoryId: String(formData.financeCategoryId),
          financeSubcategoryId: String(formData.financeSubcategoryId),
          financeCategoryName: category.name,
          financeSubcategoryName: subcategory.name,
        };

        try {
          const transactionsResponse = await apiRequest("/transactions");
          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
          }
        } catch (refreshError) {
          console.error("Transaction was saved, but the list refresh failed:", refreshError);
        }
      }

      const savedItem = {
        ...formData,
        ...linkedPurchase,
        productName: formData.productName.trim(),
        quantity: formData.quantity.trim(),
        notes: formData.notes.trim(),
        purchaseAmount: linkedPurchase.purchaseAmount ?? "",
        accountId: linkedPurchase.accountId ?? "",
        financeCategoryId: linkedPurchase.financeCategoryId ?? "",
        financeSubcategoryId: linkedPurchase.financeSubcategoryId ?? "",
        id: editingItemId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      };

      setItems((current) =>
        editingItemId
          ? current.map((item) => (item.id === editingItemId ? savedItem : item))
          : [savedItem, ...current],
      );
      closeForm();
    } catch (error) {
      console.error("Unable to save home essentials item:", error);
      setFormError(error.message || "Unable to save this item right now.");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDelete = (item) => {
    const shouldDelete = window.confirm(
      `Delete "${item.productName}" from Home & Essentials?`,
    );

    if (shouldDelete) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    }
  };

  return (
    <section className="home-essentials-page">
      <header className="home-essentials-header">
        <div>
          <h1>Home Inventory</h1>
          <p>
            Keep track of the things you buy for yourself and your home.
          </p>
        </div>

        <button
          type="button"
          className="home-essentials-primary-button"
          onClick={openAddForm}
        >
          <IconPlus size={18} stroke={2} />
          Add item
        </button>
      </header>

      {isFormOpen && (
        <form className="home-essentials-editor" onSubmit={handleSubmit}>
          <div className="home-essentials-editor-header">
            <div>
              <h2>{editingItemId ? "Edit item" : "Add an item"}</h2>
              <p>Record the details so you can find them later.</p>
            </div>
            <button
              type="button"
              className="home-essentials-icon-button"
              onClick={closeForm}
              aria-label="Close item form"
            >
              <IconX size={19} />
            </button>
          </div>

          <div className="home-essentials-form-grid">
            <label className="home-essentials-field">
              <span>Product name <b>*</b></span>
              <input
                autoFocus
                type="text"
                value={formData.productName}
                onChange={(event) =>
                  updateFormField("productName", event.target.value)
                }
                placeholder="e.g. Rice, shampoo, floor cleaner"
                maxLength={100}
                required
              />
            </label>

            <label className="home-essentials-field">
              <span>Item type</span>
              <select
                value={formData.category}
                onChange={(event) =>
                  updateFormField("category", event.target.value)
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="home-essentials-field">
              <span>Quantity <b>*</b></span>
              <input
                type="text"
                value={formData.quantity}
                onChange={(event) =>
                  updateFormField("quantity", event.target.value)
                }
                placeholder="e.g. 5 kg, 2 bottles, 1 pack"
                maxLength={50}
                required
              />
            </label>

            <label className="home-essentials-field">
              <span>Purchased date <b>*</b></span>
              <input
                type="date"
                value={formData.purchasedDate}
                onChange={(event) =>
                  updateFormField("purchasedDate", event.target.value)
                }
                required
              />
            </label>

            <label className="home-essentials-field">
              <span>Expiry date <small>Optional</small></span>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(event) =>
                  updateFormField("expiryDate", event.target.value)
                }
              />
            </label>

            <label className="home-essentials-field home-essentials-notes-field">
              <span>Notes <small>Optional</small></span>
              <input
                type="text"
                value={formData.notes}
                onChange={(event) =>
                  updateFormField("notes", event.target.value)
                }
                placeholder="Brand, storage location, or anything to remember"
                maxLength={180}
              />
            </label>

            <div className="home-essentials-finance-heading">
              <h3>Purchase expense <small>Optional</small></h3>
              <p>When you enter an amount, PennyVault creates or updates the matching expense transaction. Transactions and Budgets use that same record. Existing linked expenses must keep an amount; deleting the inventory item will not delete financial history.</p>
            </div>

            <label className="home-essentials-field">
              <span>Purchase amount (₹)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.purchaseAmount}
                onChange={(event) => updateFormField("purchaseAmount", event.target.value)}
                placeholder="Leave blank if not recording an expense"
              />
            </label>

            <label className="home-essentials-field">
              <span>Paid from account</span>
              <select
                value={formData.accountId}
                onChange={(event) => updateFormField("accountId", event.target.value)}
                disabled={!accounts.length}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountName || account.name || `Account ${account.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="home-essentials-field">
              <span>Expense category</span>
              <select
                value={formData.financeCategoryId}
                onChange={(event) => {
                  updateFormField("financeCategoryId", event.target.value);
                  updateFormField("financeSubcategoryId", "");
                }}
                disabled={!financeCategories.length}
              >
                <option value="">Select category</option>
                {financeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="home-essentials-field">
              <span>Expense subcategory</span>
              <select
                value={formData.financeSubcategoryId}
                onChange={(event) => updateFormField("financeSubcategoryId", event.target.value)}
                disabled={!formData.financeCategoryId || !subcategories.length}
              >
                <option value="">Select subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </label>

            {(() => {
              const chosenCategory = financeCategories.find(
                (entry) => String(entry.id) === String(formData.financeCategoryId)
              );
              const chosenSubcategory = subcategories.find(
                (entry) => String(entry.id) === String(formData.financeSubcategoryId)
              );
              if (!chosenCategory || !chosenSubcategory) return null;

              const categoryLimit = getCategoryBudgetLimit(
                budgetPlan,
                chosenCategory.id,
                chosenCategory.name,
              );
              const subcategoryLimit = getSubcategoryBudgetLimit(
                budgetPlan,
                chosenSubcategory.id,
                chosenSubcategory.name,
              );
              const currentMonth = getToday().slice(0, 7);
              const currentMonthExpenses = transactions.filter((transaction) => {
                const date = String(transaction.transactionDate ?? transaction.date ?? "");
                const type = String(transaction.transactionType ?? transaction.type ?? "").toUpperCase();
                return date.slice(0, 7) === currentMonth &&
                  (type === "EXPENSE" || type === "DEBIT");
              });
              const categorySpent = currentMonthExpenses
                .filter((transaction) => transaction.categoryId != null
                  ? String(transaction.categoryId) === String(chosenCategory.id)
                  : normalizeName(transaction.category) === normalizeName(chosenCategory.name))
                .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
              const subcategorySpent = currentMonthExpenses
                .filter((transaction) => {
                  const categoryMatches = transaction.categoryId != null
                    ? String(transaction.categoryId) === String(chosenCategory.id)
                    : normalizeName(transaction.category) === normalizeName(chosenCategory.name);
                  const subcategoryMatches = transaction.subcategoryId != null
                    ? String(transaction.subcategoryId) === String(chosenSubcategory.id)
                    : normalizeName(transaction.subcategory) === normalizeName(chosenSubcategory.name);
                  return categoryMatches && subcategoryMatches;
                })
                .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

              return (
                <div className="home-essentials-budget-preview">
                  <strong>{chosenCategory.name} · {chosenSubcategory.name}</strong>
                  <span>Category limit: {categoryLimit > 0 ? formatCurrency(categoryLimit) : "Not set"}</span>
                  <span>Category spent: {formatCurrency(categorySpent)} · Remaining: {categoryLimit > 0 ? formatCurrency(categoryLimit - categorySpent) : "—"}</span>
                  <span>Subcategory limit: {subcategoryLimit > 0 ? formatCurrency(subcategoryLimit) : "Not set"}</span>
                  <span>Subcategory spent: {formatCurrency(subcategorySpent)} · Remaining: {subcategoryLimit > 0 ? formatCurrency(subcategoryLimit - subcategorySpent) : "—"}</span>
                  {categoryLimit <= 0 && subcategoryLimit <= 0 && (
                    <span>Set a limit on the Budgets page. This purchase will still use the selected transaction category.</span>
                  )}
                </div>
              );
            })()}
          </div>

          {formError && (
            <p className="home-essentials-form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="home-essentials-form-actions">
            <button
              type="button"
              className="home-essentials-secondary-button"
              onClick={closeForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="home-essentials-primary-button"
              disabled={isSavingItem}
            >
              {isSavingItem ? "Saving…" : editingItemId ? "Save changes" : "Save item"}
            </button>
          </div>
        </form>
      )}

      <div className="home-essentials-summary">
        <article className="home-essentials-summary-card">
          <span className="home-essentials-summary-icon summary-total">
            <IconPackage size={23} />
          </span>
          <div>
            <p>Total items</p>
            <strong>{items.length}</strong>
          </div>
        </article>

        <article className="home-essentials-summary-card">
          <span className="home-essentials-summary-icon summary-valid">
            <IconCalendar size={23} />
          </span>
          <div>
            <p>Not expired</p>
            <strong>{validCount}</strong>
          </div>
        </article>

        <article className="home-essentials-summary-card">
          <span className="home-essentials-summary-icon summary-soon">
            <IconClock size={23} />
          </span>
          <div>
            <p>Expiring in 30 days</p>
            <strong>{expiringSoonCount}</strong>
          </div>
        </article>

        <article className="home-essentials-summary-card">
          <span className="home-essentials-summary-icon summary-expired">
            <IconAlertTriangle size={23} />
          </span>
          <div>
            <p>Expired items</p>
            <strong>{expiredCount}</strong>
          </div>
        </article>
      </div>

      <section className="home-essentials-list-card">
        <div className="home-essentials-list-header">
          <div>
            <h2>My inventory</h2>
            <p>One simple list for your personal and household essentials.</p>
          </div>
          <span className="home-essentials-result-count">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="home-essentials-toolbar">
          <label className="home-essentials-search">
            <IconSearch size={18} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, category, notes..."
              aria-label="Search inventory"
            />
          </label>

          <select
            className="home-essentials-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="home-essentials-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by expiry status"
          >
            <option value="all">All statuses</option>
            <option value="valid">In stock</option>
            <option value="soon">Expiring soon</option>
            <option value="expired">Expired</option>
            <option value="none">No expiry date</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="home-essentials-clear-button"
              onClick={clearFilters}
            >
              <IconRefresh size={16} />
              Clear filters
            </button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="home-essentials-table-scroll">
            <table className="home-essentials-table">
              <thead>
                <tr>
                  <th scope="col">Product name</th>
                  <th scope="col">Item type</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Purchased date</th>
                  <th scope="col">Expiry date</th>
                  <th scope="col">Purchase amount</th>
                  <th scope="col">Expense category</th>
                  <th scope="col">Budget status</th>
                  <th scope="col">Expiry status</th>
                  <th scope="col" className="home-essentials-actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getExpiryStatus(item.expiryDate);
                  const budgetDetails = getBudgetDetails(item, budgetPlan, transactions, getToday());

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="home-essentials-product-name">
                          {item.productName}
                          {item.notes && (
                            <span title={item.notes}>{item.notes}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="home-essentials-category">
                          {item.category || "Other"}
                        </span>
                      </td>
                      <td className="home-essentials-quantity">
                        {item.quantity}
                      </td>
                      <td>{formatDate(item.purchasedDate)}</td>
                      <td>{formatDate(item.expiryDate)}</td>
                      <td className="home-essentials-quantity">
                        {item.purchaseAmount !== "" && item.purchaseAmount != null
                          ? formatCurrency(item.purchaseAmount)
                          : "—"}
                      </td>
                      <td>
                        {item.financeCategoryName ? (
                          <span className="home-essentials-category">
                            {item.financeCategoryName}
                            {item.financeSubcategoryName ? ` · ${item.financeSubcategoryName}` : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td>
                        {budgetDetails ? (
                          <span className={`home-essentials-budget-status ${budgetDetails.remaining < 0 ? "budget-over" : "budget-ok"}`}>
                            {budgetDetails.label}
                          </span>
                        ) : "—"}
                      </td>
                      <td>
                        <span
                          className={`home-essentials-status status-${status.key}`}
                        >
                          <span aria-hidden="true" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="home-essentials-row-actions">
                          <button
                            type="button"
                            className="home-essentials-row-action"
                            onClick={() => openEditForm(item)}
                            aria-label={`Edit ${item.productName}`}
                            title="Edit item"
                          >
                            <IconPencil size={17} />
                          </button>
                          <button
                            type="button"
                            className="home-essentials-row-action delete-action"
                            onClick={() => handleDelete(item)}
                            aria-label={`Delete ${item.productName}`}
                            title="Delete item"
                          >
                            <IconTrash size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="home-essentials-empty-state">
            <span className="home-essentials-empty-icon">
              <IconPackage size={30} />
            </span>
            <h3>
              {items.length === 0
                ? "Your inventory is empty"
                : "No matching items found"}
            </h3>
            <p>
              {items.length === 0
                ? "Start with the things you buy often. Add their quantities and dates to keep everything in one place."
                : "Try another search or clear the filters to see your inventory."}
            </p>
            {items.length === 0 ? (
              <button
                type="button"
                className="home-essentials-primary-button"
                onClick={openAddForm}
              >
                <IconPlus size={18} />
                Add your first item
              </button>
            ) : (
              <button
                type="button"
                className="home-essentials-secondary-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="home-essentials-table-footer">
          <span>Expiry status is calculated automatically from the expiry date.</span>
          <span>{items.length} total {items.length === 1 ? "record" : "records"}</span>
        </div>
      </section>
    </section>
  );
}

export default HomeEssentials;