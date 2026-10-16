import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../services/apiClient";
import "../Styles/BudgetCategories.css";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const categoryPresentation = (name = "") => {
  const value = name.toLowerCase();
  if (value.includes("home") || value.includes("utilit")) return { icon: "⌂", color: "purple" };
  if (value.includes("food") || value.includes("grocer")) return { icon: "🛒", color: "green" };
  if (value.includes("transport")) return { icon: "🚗", color: "blue" };
  if (value.includes("health") || value.includes("personal care")) return { icon: "♥", color: "pink" };
  if (value.includes("education") || value.includes("kids")) return { icon: "🎓", color: "orange" };
  if (value.includes("entertain")) return { icon: "▣", color: "purple" };
  if (value.includes("finance") || value.includes("invest")) return { icon: "▰", color: "teal" };
  if (value.includes("travel")) return { icon: "✈", color: "blue" };
  if (value.includes("gift")) return { icon: "🎁", color: "pink" };
  if (value.includes("shopping")) return { icon: "🛍", color: "purple" };
  if (value.includes("subscription")) return { icon: "▣", color: "teal" };
  if (value.includes("pet")) return { icon: "♥", color: "orange" };
  if (value.includes("work") || value.includes("business")) return { icon: "▰", color: "blue" };
  return { icon: "•", color: "purple" };
};

function Budgets() {
  const monthInputRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [categories, setCategories] = useState([]);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [panelMode, setPanelMode] = useState("details");

  const selectedMonthLabel = new Date(`${selectedMonth}-01T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const loadCategoryBudgets = async () => {
    setBudgetLoading(true);
    setBudgetError("");
    try {
      const response = await apiRequest(`/budgets/categories?month=${selectedMonth}`);
      if (!response.ok) throw new Error("Unable to load category budgets for this month.");
      const data = await response.json();
      const expenseCategories = data
        .filter((item) => !["income", "transfers"].includes((item.name || "").trim().toLowerCase()))
        .map((item) => ({
          ...item,
          allocated: Number(item.budgetLimit || 0),
          spent: Number(item.spent || 0),
          ...categoryPresentation(item.name),
        }));
      setCategories(expenseCategories);
    } catch (error) {
      setCategories([]);
      setBudgetError(error.message || "Unable to load category budgets for this month.");
    } finally {
      setBudgetLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryBudgets();
    setSelectedCategory(null);
    setShowBudgetForm(false);
    // The selected month is the sole trigger for reloading its independent data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const configuredCategories = useMemo(
    () => categories.filter((category) => category.configured),
    [categories]
  );
  const hasAnyBudget = configuredCategories.length > 0;
  const totalBudget = configuredCategories.reduce((sum, category) => sum + category.allocated, 0);
  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
  const remaining = totalBudget - totalSpent;
  const categoriesForForm = categories;

  const openBudgetForm = (category = null) => {
    setSaveError("");
    setFormCategoryId(category ? String(category.categoryId) : "");
    setFormAmount(category?.configured ? String(category.allocated) : "");
    setShowBudgetForm(true);
  };

  const saveCategoryBudget = async (event) => {
    event.preventDefault();
    setSaveError("");
    const amount = Number(formAmount);
    if (!formCategoryId || formAmount.trim() === "" || !Number.isFinite(amount) || amount < 0) {
      setSaveError("Choose a category and enter a valid budget limit.");
      return;
    }
    setSaving(true);
    try {
      const response = await apiRequest(`/budgets/categories?month=${selectedMonth}`, {
        method: "PUT",
        body: JSON.stringify({ categoryId: Number(formCategoryId), budgetLimit: amount }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Unable to save this category budget.");
      }
      setShowBudgetForm(false);
      await loadCategoryBudgets();
    } catch (error) {
      setSaveError(error.message || "Unable to save this category budget.");
    } finally {
      setSaving(false);
    }
  };

  const openPanel = (category, mode) => {
    setSelectedCategory(category);
    setPanelMode(mode);
  };

  const closePanel = () => setSelectedCategory(null);

  return (
    <div className="budgets-page">
      <header className="budget-header">
        <div>
          <h1>Budgets</h1>
          <p>Plan smarter. Spend better. Stay on track.</p>
        </div>
        <div className="budget-header-actions">
          <div className="month-selector-wrap">
            <button
              className="month-selector"
              type="button"
              aria-label="Select budget month"
              onClick={() => {
                const input = monthInputRef.current;
                if (!input) return;
                if (typeof input.showPicker === "function") input.showPicker();
                else { input.focus(); input.click(); }
              }}
            >
              <span>▣</span>
              {selectedMonthLabel}
              <span className="chevron">⌄</span>
            </button>
            <input
              ref={monthInputRef}
              className="month-selector-input"
              type="month"
              value={selectedMonth}
              aria-label="Choose month for budget"
              onChange={(event) => event.target.value && setSelectedMonth(event.target.value)}
            />
          </div>
        </div>
      </header>

      {budgetError && <p role="alert" className="budget-load-error">{budgetError}</p>}

      <section className="budget-summary">
        <div className="summary-card">
          <div className="summary-icon purple">▣</div>
          <div>
            <span className="summary-label">Monthly Budget</span>
            <strong>{budgetLoading ? "Loading..." : formatCurrency(totalBudget)}</strong>
            {!budgetLoading && !budgetError && hasAnyBudget && (
              <button className="edit-budget" type="button" onClick={() => openBudgetForm()}>
                ✎ Add / Edit Budget
              </button>
            )}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green">↗</div>
          <div>
            <span className="summary-label">Total Allocated</span>
            <strong>{budgetLoading ? "Loading..." : formatCurrency(totalBudget)}</strong>
            <small className="positive">{hasAnyBudget ? "Saved category limits" : "No allocations saved"}</small>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">▣</div>
          <div>
            <span className="summary-label">Remaining</span>
            <strong>{budgetLoading ? "Loading..." : formatCurrency(remaining)}</strong>
            <small className={remaining < 0 ? "negative" : "positive"}>
              {hasAnyBudget ? (remaining < 0 ? "Over budget" : "Budget less monthly spending") : "No budget set"}
            </small>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="section-heading">
          <h2>All Budget Categories</h2>
          {!budgetLoading && !budgetError && hasAnyBudget && (
            <button className="summary-button" type="button" onClick={() => openBudgetForm()}>
              ◔ Add / Edit Budget
            </button>
          )}
        </div>

        {budgetLoading ? (
          <div className="budget-empty-state"><p>Loading budgets for {selectedMonthLabel}...</p></div>
        ) : !budgetError && !hasAnyBudget ? (
          <div className="budget-empty-state">
            <div className="budget-empty-icon">▣</div>
            <h3>No budgets set for {selectedMonthLabel}</h3>
            <p>Add a category budget to start tracking this month's spending. Other months' budget limits will remain unchanged.</p>
            <button className="primary-button" type="button" onClick={() => openBudgetForm()}>
              <span>＋</span> Add Your First Budget
            </button>
          </div>
        ) : !budgetError ? (
          <div className="category-grid">
            {configuredCategories.map((category) => {
              const percentage = category.allocated > 0
                ? Math.round((category.spent / category.allocated) * 100)
                : 0;
              const remainingAmount = category.allocated - category.spent;
              return (
                <article className={`category-card ${selectedCategory?.categoryId === category.categoryId ? "selected" : ""}`} key={category.categoryId}>
                  <div className="category-top">
                    <div className={`category-icon ${category.color}`}>{category.icon}</div>
                    <h3>{category.name}</h3>
                    <button className="more-button" type="button" aria-label={`Edit ${category.name} budget`} onClick={() => openBudgetForm(category)}>⋮</button>
                  </div>
                  <div className="category-values">
                    <div><span>Allocated</span><strong>{formatCurrency(category.allocated)}</strong></div>
                    <div><span>Spent</span><strong>{formatCurrency(category.spent)}</strong></div>
                    <div><span>Remaining</span><strong>{formatCurrency(remainingAmount)}</strong></div>
                  </div>
                  <div className="category-progress-row">
                    <div className="progress-track">
                      <div className={`progress-fill ${category.color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                    </div>
                    <strong>{percentage}%</strong>
                  </div>
                  <div className="category-actions">
                    <button type="button" onClick={() => openPanel(category, "details")}>◔ Budget Details</button>
                    <button type="button" onClick={() => openPanel(category, "subcategories")}>☷ Subcategories</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="budget-tip">
        <div className="tip-icon">♧</div>
        <div>
          <strong>Tip</strong>
          <p>Review your budgets regularly and adjust them based on your spending.</p>
        </div>
      </div>

      {showBudgetForm && (
        <div className="budget-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowBudgetForm(false);
        }}>
          <form className="budget-modal" onSubmit={saveCategoryBudget}>
            <div className="budget-modal-header">
              <div>
                <h2>{formCategoryId ? "Set Category Budget" : "Add Category Budget"}</h2>
                <p>{selectedMonthLabel} · saved independently for this month</p>
              </div>
              <button type="button" className="close-panel" aria-label="Close" onClick={() => setShowBudgetForm(false)}>×</button>
            </div>
            <label htmlFor="budget-category">Category</label>
            <select id="budget-category" value={formCategoryId} onChange={(event) => {
              setFormCategoryId(event.target.value);
              const match = categories.find((item) => String(item.categoryId) === event.target.value);
              setFormAmount(match?.configured ? String(match.allocated) : "");
            }} required>
              <option value="">Choose a category</option>
              {categoriesForForm.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
              ))}
            </select>
            <label htmlFor="budget-limit">Monthly budget limit (₹)</label>
            <input id="budget-limit" type="number" min="0" step="0.01" value={formAmount} onChange={(event) => setFormAmount(event.target.value)} placeholder="Enter amount" required />
            {saveError && <p role="alert" className="budget-load-error">{saveError}</p>}
            <div className="budget-modal-actions">
              <button className="cancel-button" type="button" onClick={() => setShowBudgetForm(false)}>Cancel</button>
              <button className="save-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Budget"}</button>
            </div>
          </form>
        </div>
      )}

      {selectedCategory && (
        <div className="budget-panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className={`panel-category-icon ${selectedCategory.color}`}>{selectedCategory.icon}</div>
              <div>
                <h2>{selectedCategory.name}</h2>
                <p>{panelMode === "details" ? `Budget details · ${selectedMonthLabel}` : "Category spending"}</p>
              </div>
            </div>
            <button className="close-panel" type="button" aria-label="Close details" onClick={closePanel}>×</button>
          </div>
          <div className="panel-tabs">
            <button type="button" className={panelMode === "details" ? "active" : ""} onClick={() => setPanelMode("details")}>◔ Budget Details</button>
            <button type="button" className={panelMode === "subcategories" ? "active" : ""} onClick={() => setPanelMode("subcategories")}>☷ Subcategories</button>
          </div>
          <div className="panel-summary">
            <div><strong>{formatCurrency(selectedCategory.allocated)}</strong><span>Budget</span></div>
            <div><strong className="purple-text">{formatCurrency(selectedCategory.spent)}</strong><span>Spent</span></div>
            <div><strong className="green-text">{formatCurrency(selectedCategory.allocated - selectedCategory.spent)}</strong><span>Remaining</span></div>
          </div>
          <div className="panel-progress">
            <div className="panel-progress-fill" style={{ width: `${selectedCategory.allocated > 0 ? Math.min((selectedCategory.spent / selectedCategory.allocated) * 100, 100) : 0}%` }} />
            <strong>{selectedCategory.allocated > 0 ? Math.round((selectedCategory.spent / selectedCategory.allocated) * 100) : 0}%</strong>
          </div>
          {panelMode === "details" ? (
            <div className="details-content">
              <section className="panel-section">
                <div className="panel-section-heading">
                  <h3>Budget Details</h3>
                  <button className="icon-button" type="button" onClick={() => { closePanel(); openBudgetForm(selectedCategory); }}>✎</button>
                </div>
                <div className="form-grid">
                  <div><label>Monthly Budget</label><div className="fake-input">{formatCurrency(selectedCategory.allocated)}</div></div>
                  <div><label>Budget Period</label><div className="fake-input">Monthly</div></div>
                </div>
                <p className="budget-panel-note">Spending is calculated from expense transactions dated in {selectedMonthLabel}.</p>
              </section>
            </div>
          ) : (
            <div className="subcategory-content">
              <div className="budget-empty-state compact">
                <h3>Subcategory budgets aren't configured yet</h3>
                <p>The amount spent above is based on transactions assigned to this category for {selectedMonthLabel}.</p>
              </div>
            </div>
          )}
          <div className="panel-footer">
            <button className="cancel-button" type="button" onClick={closePanel}>Close</button>
            <button className="save-button" type="button" onClick={() => { closePanel(); openBudgetForm(selectedCategory); }}>Edit Budget</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
