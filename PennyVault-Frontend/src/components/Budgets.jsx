import React, { useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconPencil,
  IconRefresh,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import { apiRequest } from "../services/apiClient";
import {
  getCategoryBudgetLimit,
  getSubcategoryBudgetLimit,
  readBudgetPlan,
  saveBudgetPlan,
} from "../utils/budgetConfig";
import "../Styles/BudgetCategories.css";

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

const normaliseName = (value) => String(value ?? "").trim().toLowerCase();

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const isCurrentMonthExpense = (transaction, currentMonth) => {
  const transactionDate = String(transaction.transactionDate ?? transaction.date ?? "");
  const transactionType = String(transaction.transactionType ?? transaction.type ?? "").toUpperCase();
  return transactionDate.slice(0, 7) === currentMonth &&
    (transactionType === "EXPENSE" || transactionType === "DEBIT");
};

const getPercent = (spent, limit) => {
  const amount = Number(spent) || 0;
  const budget = Number(limit) || 0;
  if (budget <= 0) return amount > 0 ? 100 : 0;
  return Math.round((amount / budget) * 100);
};

function Budgets() {
  const [budgetPlan, setBudgetPlan] = useState(readBudgetPlan);
  const [categories, setCategories] = useState([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [draftCategoryLimit, setDraftCategoryLimit] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [draftSubcategoryLimit, setDraftSubcategoryLimit] = useState("");
  const [isEditingMonthlyBudget, setIsEditingMonthlyBudget] = useState(false);
  const [draftMonthlyBudget, setDraftMonthlyBudget] = useState("");

  const currentMonth = getCurrentMonthKey();
  const monthLabel = useMemo(
    () => new Date(`${currentMonth}-01T00:00:00`).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    [currentMonth],
  );

  useEffect(() => {
    saveBudgetPlan(budgetPlan);
  }, [budgetPlan]);

  useEffect(() => {
    let isMounted = true;

    const loadBudgetSources = async () => {
      setIsLoading(true);
      setLoadError("");

      let categoryData = [];
      let transactionData = [];
      const errors = [];

      try {
        const response = await apiRequest("/categories");
        if (!response.ok) throw new Error("Could not load the transaction categories.");
        const result = await response.json();
        categoryData = Array.isArray(result) ? result : [];
      } catch (error) {
        errors.push(error.message || "Could not load categories.");
      }

      try {
        const response = await apiRequest("/transactions");
        if (!response.ok) throw new Error("Could not load transactions.");
        const result = await response.json();
        transactionData = Array.isArray(result) ? result : [];
      } catch (error) {
        errors.push(error.message || "Could not load transactions.");
      }

      const subcategoryEntries = await Promise.all(
        categoryData.map(async (category) => {
          try {
            const response = await apiRequest(`/subcategories/category/${category.id}`);
            if (!response.ok) return [String(category.id), []];
            const result = await response.json();
            return [String(category.id), Array.isArray(result) ? result : []];
          } catch (error) {
            console.error("Could not load budget subcategories:", error);
            return [String(category.id), []];
          }
        }),
      );

      if (isMounted) {
        setCategories(categoryData);
        setTransactions(transactionData);
        setSubcategoriesByCategory(Object.fromEntries(subcategoryEntries));
        setLoadError(errors.join(" "));
        setIsLoading(false);
      }
    };

    loadBudgetSources();
    return () => {
      isMounted = false;
    };
  }, []);

  const monthlyBudget = Number(budgetPlan.monthlyBudget) || 0;
  const currentMonthTransactions = transactions.filter((transaction) =>
    isCurrentMonthExpense(transaction, currentMonth)
  );

  const totalSpent = currentMonthTransactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) || 0),
    0,
  );

  const getCategorySpent = (category) =>
    currentMonthTransactions
      .filter((transaction) => {
        if (transaction.categoryId != null) {
          return String(transaction.categoryId) === String(category.id);
        }
        return normaliseName(transaction.category) === normaliseName(category.name);
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

  const getSubcategorySpent = (category, subcategory) =>
    currentMonthTransactions
      .filter((transaction) => {
        const categoryMatches = transaction.categoryId != null
          ? String(transaction.categoryId) === String(category.id)
          : normaliseName(transaction.category) === normaliseName(category.name);
        const subcategoryMatches = transaction.subcategoryId != null
          ? String(transaction.subcategoryId) === String(subcategory.id)
          : normaliseName(transaction.subcategory) === normaliseName(subcategory.name);
        return categoryMatches && subcategoryMatches;
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

  const totalAllocated = categories.reduce(
    (sum, category) =>
      sum + getCategoryBudgetLimit(budgetPlan, category.id, category.name),
    0,
  );

  const beginMonthlyBudgetEdit = () => {
    setDraftMonthlyBudget(String(monthlyBudget));
    setIsEditingMonthlyBudget(true);
  };

  const saveMonthlyBudget = () => {
    const value = Number(draftMonthlyBudget);
    if (!Number.isFinite(value) || value <= 0) return;
    setBudgetPlan((current) => ({ ...current, monthlyBudget: value }));
    setIsEditingMonthlyBudget(false);
  };

  const beginCategoryEdit = (category) => {
    setEditingCategoryId(String(category.id));
    setDraftCategoryLimit(String(getCategoryBudgetLimit(budgetPlan, category.id, category.name)));
    setEditingSubcategoryId(null);
  };

  const saveCategoryLimit = (category) => {
    const value = Number(draftCategoryLimit);
    if (!Number.isFinite(value) || value < 0) return;
    setBudgetPlan((current) => ({
      ...current,
      categoryBudgets: {
        ...(current.categoryBudgets || {}),
        [String(category.id)]: value,
      },
    }));
    setEditingCategoryId(null);
  };

  const beginSubcategoryEdit = (subcategory) => {
    setEditingSubcategoryId(String(subcategory.id));
    setDraftSubcategoryLimit(String(
      getSubcategoryBudgetLimit(budgetPlan, subcategory.id, subcategory.name)
    ));
    setEditingCategoryId(null);
  };

  const saveSubcategoryLimit = (subcategory) => {
    const value = Number(draftSubcategoryLimit);
    if (!Number.isFinite(value) || value < 0) return;
    setBudgetPlan((current) => ({
      ...current,
      subcategoryBudgets: {
        ...(current.subcategoryBudgets || {}),
        [String(subcategory.id)]: value,
      },
    }));
    setEditingSubcategoryId(null);
  };

  return (
    <section className="finance-budgets-page">
      <header className="finance-budgets-header">
        <div>
          <h1>Budgets</h1>
          <p>Budget limits and spending are based on the same categories and transactions used in PennyVault.</p>
        </div>
        <div className="finance-budgets-header-date">
          <IconCalendar size={17} />
          {monthLabel}
        </div>
      </header>

      {loadError && (
        <div className="finance-budgets-alert" role="alert">
          <IconAlertTriangle size={19} />
          <span>{loadError} Check that the backend is running and you are signed in.</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            aria-label="Reload budget data"
          >
            <IconRefresh size={17} />
            Retry
          </button>
        </div>
      )}

      <div className="finance-budgets-summary">
        <article className="finance-budgets-summary-card summary-budget-limit">
          <span className="finance-budgets-summary-icon"><IconWallet size={22} /></span>
          <div className="finance-budgets-summary-content">
            <p>Monthly budget</p>
            {isEditingMonthlyBudget ? (
              <div className="finance-budgets-inline-edit">
                <span>₹</span>
                <input
                  type="number"
                  min="1"
                  value={draftMonthlyBudget}
                  onChange={(event) => setDraftMonthlyBudget(event.target.value)}
                  aria-label="Monthly budget limit"
                />
                <button type="button" onClick={saveMonthlyBudget} aria-label="Save monthly budget">
                  <IconCheck size={16} />
                </button>
                <button type="button" onClick={() => setIsEditingMonthlyBudget(false)} aria-label="Cancel monthly budget edit">
                  <IconX size={16} />
                </button>
              </div>
            ) : (
              <div className="finance-budgets-summary-value-row">
                <strong>{formatCurrency(monthlyBudget)}</strong>
                <button type="button" onClick={beginMonthlyBudgetEdit} aria-label="Edit monthly budget">
                  <IconPencil size={15} />
                </button>
              </div>
            )}
            <span>Set your overall monthly limit</span>
          </div>
        </article>

        <article className="finance-budgets-summary-card summary-budget-spent">
          <span className="finance-budgets-summary-icon"><IconCalendar size={22} /></span>
          <div className="finance-budgets-summary-content">
            <p>Spent this month</p>
            <strong>{formatCurrency(totalSpent)}</strong>
            <span>{currentMonthTransactions.length} expense transactions</span>
          </div>
        </article>

        <article className="finance-budgets-summary-card summary-budget-remaining">
          <span className="finance-budgets-summary-icon"><IconClock size={22} /></span>
          <div className="finance-budgets-summary-content">
            <p>Monthly remaining</p>
            <strong className={monthlyBudget - totalSpent < 0 ? "is-over-budget" : ""}>
              {formatCurrency(monthlyBudget - totalSpent)}
            </strong>
            <span>{monthlyBudget > 0 ? `${getPercent(totalSpent, monthlyBudget)}% used` : "Set your monthly limit"}</span>
          </div>
        </article>

        <article className="finance-budgets-summary-card summary-budget-allocated">
          <span className="finance-budgets-summary-icon"><IconRefresh size={22} /></span>
          <div className="finance-budgets-summary-content">
            <p>Category limits</p>
            <strong>{formatCurrency(totalAllocated)}</strong>
            <span>{categories.length} transaction categories</span>
          </div>
        </article>
      </div>

      <section className="finance-budgets-category-section">
        <div className="finance-budgets-section-header">
          <div>
            <h2>Budget by transaction category</h2>
            <p>Edit a category or subcategory limit here; Home Inventory uses the same saved limits.</p>
          </div>
          <span className="finance-budgets-month-pill">{monthLabel}</span>
        </div>

        {isLoading ? (
          <div className="finance-budgets-empty-state">
            <span className="finance-budgets-loading-mark"><IconRefresh size={24} /></span>
            <h3>Loading budgets</h3>
            <p>Reading your categories and transactions from PennyVault.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="finance-budgets-empty-state">
            <span className="finance-budgets-loading-mark"><IconWallet size={24} /></span>
            <h3>No transaction categories found</h3>
            <p>Once the Transactions page has categories available from the backend, they will appear here with matching budget controls.</p>
          </div>
        ) : (
          <div className="finance-budgets-category-list">
            {categories.map((category) => {
              const budget = getCategoryBudgetLimit(budgetPlan, category.id, category.name);
              const spent = getCategorySpent(category);
              const remaining = budget - spent;
              const percentage = getPercent(spent, budget);
              const categorySubcategories = subcategoriesByCategory[String(category.id)] || [];
              const isExpanded = String(expandedCategoryId) === String(category.id);
              const isEditing = editingCategoryId === String(category.id);

              return (
                <article className="finance-budgets-category-card" key={category.id}>
                  <div className="finance-budgets-category-main">
                    <div className="finance-budgets-category-icon">
                      {category.icon || category.name?.slice(0, 1) || "•"}
                    </div>

                    <div className="finance-budgets-category-name">
                      <h3>{category.name}</h3>
                      <p>{categorySubcategories.length} subcategories</p>
                    </div>

                    <div className="finance-budgets-category-metric">
                      <span>Budget limit</span>
                      {isEditing ? (
                        <div className="finance-budgets-inline-edit">
                          <span>₹</span>
                          <input
                            type="number"
                            min="0"
                            value={draftCategoryLimit}
                            onChange={(event) => setDraftCategoryLimit(event.target.value)}
                            aria-label={`${category.name} budget limit`}
                          />
                          <button type="button" onClick={() => saveCategoryLimit(category)} aria-label="Save category budget">
                            <IconCheck size={16} />
                          </button>
                          <button type="button" onClick={() => setEditingCategoryId(null)} aria-label="Cancel category budget edit">
                            <IconX size={16} />
                          </button>
                        </div>
                      ) : (
                        <strong>{budget > 0 ? formatCurrency(budget) : "Not set"}</strong>
                      )}
                    </div>

                    <div className="finance-budgets-category-metric">
                      <span>Spent this month</span>
                      <strong>{formatCurrency(spent)}</strong>
                    </div>

                    <div className="finance-budgets-category-metric">
                      <span>Remaining</span>
                      <strong className={remaining < 0 ? "is-over-budget" : ""}>
                        {budget > 0 ? formatCurrency(remaining) : "Set a limit"}
                      </strong>
                    </div>

                    <div className="finance-budgets-category-actions">
                      <button
                        type="button"
                        onClick={() => beginCategoryEdit(category)}
                        aria-label={`Edit ${category.name} budget limit`}
                        title="Edit category limit"
                      >
                        <IconPencil size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedCategoryId(isExpanded ? null : String(category.id))}
                        aria-expanded={isExpanded}
                        aria-label={`Show ${category.name} subcategory budgets`}
                        title="View subcategory budgets"
                      >
                        {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="finance-budgets-progress-track">
                    <div
                      className={`finance-budgets-progress-fill ${remaining < 0 ? "progress-over" : ""}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="finance-budgets-category-footer">
                    <span>
                      {budget <= 0
                        ? "No category limit configured yet"
                        : remaining < 0
                          ? "Over budget"
                          : `${formatCurrency(remaining)} remaining`}
                    </span>
                    <span>{budget > 0 ? `${percentage}% used` : "—"}</span>
                  </div>

                  {isExpanded && (
                    <div className="finance-budgets-subcategory-list">
                      {categorySubcategories.length === 0 ? (
                        <p className="finance-budgets-subcategory-empty">No subcategories are configured for this category.</p>
                      ) : categorySubcategories.map((subcategory) => {
                        const subBudget = getSubcategoryBudgetLimit(
                          budgetPlan,
                          subcategory.id,
                          subcategory.name,
                        );
                        const subSpent = getSubcategorySpent(category, subcategory);
                        const subRemaining = subBudget - subSpent;
                        const subPercentage = getPercent(subSpent, subBudget);
                        const editingSubcategory = editingSubcategoryId === String(subcategory.id);

                        return (
                          <div className="finance-budgets-subcategory-row" key={subcategory.id}>
                            <div className="finance-budgets-subcategory-name">
                              <span>{subcategory.name}</span>
                              {editingSubcategory ? (
                                <div className="finance-budgets-inline-edit">
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={draftSubcategoryLimit}
                                    onChange={(event) => setDraftSubcategoryLimit(event.target.value)}
                                    aria-label={`${subcategory.name} budget limit`}
                                  />
                                  <button type="button" onClick={() => saveSubcategoryLimit(subcategory)} aria-label="Save subcategory budget">
                                    <IconCheck size={15} />
                                  </button>
                                  <button type="button" onClick={() => setEditingSubcategoryId(null)} aria-label="Cancel subcategory budget edit">
                                    <IconX size={15} />
                                  </button>
                                </div>
                              ) : (
                                <strong>{subBudget > 0 ? formatCurrency(subBudget) : "Not set"}</strong>
                              )}
                            </div>
                            <div className="finance-budgets-subcategory-spend">
                              <span>Spent {formatCurrency(subSpent)}</span>
                              <span className={subBudget > 0 && subRemaining < 0 ? "is-over-budget" : ""}>
                                {subBudget > 0 ? `${formatCurrency(subRemaining)} left` : "Set a limit"}
                              </span>
                            </div>
                            <div className="finance-budgets-subcategory-progress">
                              <div
                                className={`finance-budgets-progress-fill ${subRemaining < 0 ? "progress-over" : ""}`}
                                style={{ width: `${Math.min(subPercentage, 100)}%` }}
                              />
                            </div>
                            <button
                              className="finance-budgets-subcategory-edit"
                              type="button"
                              onClick={() => beginSubcategoryEdit(subcategory)}
                              aria-label={`Edit ${subcategory.name} budget limit`}
                            >
                              <IconPencil size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

export default Budgets;