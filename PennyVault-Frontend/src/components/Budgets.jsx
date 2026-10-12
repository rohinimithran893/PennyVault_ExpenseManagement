import React, { useEffect, useState } from "react";
import "../Styles/BudgetCategories.css";
import { getToken } from "../utils/auth";
import { DEFAULT_BUDGET_CATEGORIES, readBudgetPlan, saveBudgetPlan } from "../utils/budgetConfig";



const members = [
  { name: "Rohini (You)", amount: 10000, percent: 50, initial: "R" },
  { name: "Varun", amount: 6000, percent: 30, initial: "V" },
  { name: "Meera", amount: 4000, percent: 20, initial: "M" },
];

const formatCurrency = (value) =>
  `₹${value.toLocaleString("en-IN")}`;

function Budgets() {
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [panelMode, setPanelMode] = useState("details");
  const [budgetPlan, setBudgetPlan] = useState(readBudgetPlan);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [budgetEditMode, setBudgetEditMode] = useState(false);
  const [draftAllocated, setDraftAllocated] = useState("");
  const [draftMonthlyBudget, setDraftMonthlyBudget] = useState("");

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const normalizeName = (value) => String(value ?? "").trim().toLowerCase();
  const isCurrentMonthExpense = (transaction) => {
    const transactionDate = transaction.transactionDate ?? transaction.date ?? "";
    const transactionType = String(transaction.transactionType ?? transaction.type ?? "").toUpperCase();
    return String(transactionDate).slice(0, 7) === currentMonth &&
      (transactionType === "EXPENSE" || transactionType === "DEBIT");
  };

  useEffect(() => {
    saveBudgetPlan(budgetPlan);
  }, [budgetPlan]);

  useEffect(() => {
    let isMounted = true;
    const loadTransactions = async () => {
      try {
        const token = getToken();
        const response = await fetch("http://localhost:8080/api/transactions", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Unable to load transactions for budget totals.");
        }
        const data = await response.json();
        if (isMounted) {
          setTransactions(Array.isArray(data) ? data : []);
          setTransactionsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading transactions for budget totals:", error);
        if (isMounted) setTransactionsLoaded(false);
      }
    };
    loadTransactions();
    return () => { isMounted = false; };
  }, []);

  const configuredCategories = Array.isArray(budgetPlan.categories)
    ? budgetPlan.categories
    : DEFAULT_BUDGET_CATEGORIES;

  const categories = configuredCategories.map((category) => {
    const subcategories = (category.subcategories || []).map((subcategory) => {
      const actualSpend = transactions
        .filter((transaction) =>
          isCurrentMonthExpense(transaction) &&
          normalizeName(transaction.subcategory) === normalizeName(subcategory.name)
        )
        .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
      return {
        ...subcategory,
        spent: transactionsLoaded ? actualSpend : Number(subcategory.spent) || 0,
      };
    });
    const categorySpend = subcategories.reduce(
      (sum, subcategory) => sum + (Number(subcategory.spent) || 0),
      0
    );
    return {
      ...category,
      allocated: Number(category.allocated) || 0,
      spent: transactionsLoaded ? categorySpend : Number(category.spent) || 0,
      subcategories,
    };
  });

  const selectedCategory = categories.find(
    (category) => category.name === selectedCategoryName
  ) || null;
  const totalBudget = Number(budgetPlan.monthlyBudget) || 80000;
  const totalAllocated = configuredCategories.reduce(
    (sum, category) => sum + (Number(category.allocated) || 0),
    0
  );
  const remaining = totalBudget - totalAllocated;

  const openPanel = (category, mode) => {
    setSelectedCategoryName(category.name);
    setPanelMode(mode);
    setBudgetEditMode(false);
  };

  const closePanel = () => {
    setSelectedCategoryName(null);
    setBudgetEditMode(false);
  };

  const beginBudgetEdit = () => {
    if (!selectedCategory) return;
    setDraftAllocated(String(selectedCategory.allocated));
    setDraftMonthlyBudget(String(totalBudget));
    setBudgetEditMode(true);
  };

  const saveBudgetEdits = () => {
    const allocated = Number(draftAllocated);
    const monthly = Number(draftMonthlyBudget);
    if (!Number.isFinite(allocated) || allocated < 0 ||
        !Number.isFinite(monthly) || monthly <= 0) {
      return;
    }
    setBudgetPlan((current) => ({
      ...current,
      monthlyBudget: monthly,
      categories: (current.categories || DEFAULT_BUDGET_CATEGORIES).map((category) =>
        category.name === selectedCategoryName
          ? { ...category, allocated }
          : category
      ),
    }));
    setBudgetEditMode(false);
  };

  return (
    <div className="budgets-page">
      {/* PAGE HEADER */}
      <header className="budget-header">
        <div>
          <h1>Budgets</h1>
          <p>Plan smarter. Spend better. Stay on track.</p>
        </div>

        <div className="budget-header-actions">
          <button className="month-selector">
            <span>▣</span>
            July 2026
            <span className="chevron">⌄</span>
          </button>

          <button className="primary-button">
            <span>＋</span>
            Add Category
          </button>
        </div>
      </header>

      {/* SUMMARY */}
      <section className="budget-summary">
        <div className="summary-card">
          <div className="summary-icon purple">
            ▣
          </div>

          <div>
            <span className="summary-label">Monthly Budget</span>
            <strong>{formatCurrency(totalBudget)}</strong>

            <button className="edit-budget">
              ✎ Edit Budget
            </button>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            ↗
          </div>

          <div>
            <span className="summary-label">Total Allocated</span>
            <strong>{formatCurrency(totalAllocated)}</strong>

            <small className="positive">
              98.8% of budget
            </small>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            ▣
          </div>

          <div>
            <span className="summary-label">Remaining</span>
            <strong>{formatCurrency(remaining)}</strong>

            <small className="negative">
              1.2% of budget
            </small>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="category-section">
        <div className="section-heading">
          <h2>All Budget Categories</h2>

          <button className="summary-button">
            ◔ View Summary
          </button>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const percentage = Math.round(
              (category.spent / category.allocated) * 100
            );

            const remainingAmount =
              category.allocated - category.spent;

            return (
              <article
                className={`category-card ${
                  selectedCategory?.name === category.name
                    ? "selected"
                    : ""
                }`}
                key={category.name}
              >
                <div className="category-top">
                  <div className={`category-icon ${category.color}`}>
                    {category.icon}
                  </div>

                  <h3>{category.name}</h3>

                  <button className="more-button">⋮</button>
                </div>

                <div className="category-values">
                  <div>
                    <span>Allocated</span>
                    <strong>
                      {formatCurrency(category.allocated)}
                    </strong>
                  </div>

                  <div>
                    <span>Spent</span>
                    <strong>
                      {formatCurrency(category.spent)}
                    </strong>
                  </div>

                  <div>
                    <span>Remaining</span>
                    <strong>
                      {formatCurrency(remainingAmount)}
                    </strong>
                  </div>
                </div>

                <div className="category-progress-row">
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${category.color}`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>

                  <strong>{percentage}%</strong>
                </div>

                {/* TWO ACTIONS */}
                <div className="category-actions">
                  <button
                    className={
                      panelMode === "details" &&
                      selectedCategory?.name === category.name
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      openPanel(category, "details")
                    }
                  >
                    ◔ Budget Details
                  </button>

                  <button
                    className={
                      panelMode === "subcategories" &&
                      selectedCategory?.name === category.name
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      openPanel(category, "subcategories")
                    }
                  >
                    ☷ Subcategories
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* TIP */}
      <div className="budget-tip">
        <div className="tip-icon">♧</div>

        <div>
          <strong>Tip</strong>
          <p>
            Review your budgets regularly and adjust them based
            on your spending.
          </p>
        </div>

        <button>Learn more →</button>
      </div>

      {/* RIGHT SIDE PANEL */}
      {selectedCategory && (
        <div className="budget-panel">
          <div className="panel-header">
            <div className="panel-title">
              <div
                className={`panel-category-icon ${selectedCategory.color}`}
              >
                {selectedCategory.icon}
              </div>

              <div>
                <h2>{selectedCategory.name}</h2>
                <p>
                  {panelMode === "details"
                    ? "Manage your budget"
                    : "Manage subcategories"}
                </p>
              </div>
            </div>

            <button
              className="close-panel"
              onClick={closePanel}
            >
              ×
            </button>
          </div>

          {/* PANEL TABS */}
          <div className="panel-tabs">
            <button
              className={
                panelMode === "details" ? "active" : ""
              }
              onClick={() => setPanelMode("details")}
            >
              ◔ Budget Details
            </button>

            <button
              className={
                panelMode === "subcategories"
                  ? "active"
                  : ""
              }
              onClick={() => setPanelMode("subcategories")}
            >
              ☷ Subcategories
            </button>
          </div>

          {/* PANEL SUMMARY */}
          <div className="panel-summary">
            <div>
              <strong>
                {formatCurrency(selectedCategory.allocated)}
              </strong>
              <span>Budget</span>
            </div>

            <div>
              <strong className="purple-text">
                {formatCurrency(selectedCategory.spent)}
              </strong>
              <span>
                Spent (
                {Math.round(
                  (selectedCategory.spent /
                    selectedCategory.allocated) *
                    100
                )}
                %)
              </span>
            </div>

            <div>
              <strong className="green-text">
                {formatCurrency(
                  selectedCategory.allocated -
                    selectedCategory.spent
                )}
              </strong>
              <span>Remaining</span>
            </div>
          </div>

          <div className="panel-progress">
            <div
              className="panel-progress-fill"
              style={{
                width: `${Math.min(
                  (selectedCategory.spent /
                    selectedCategory.allocated) *
                    100,
                  100
                )}%`,
              }}
            />

            <strong>
              {Math.round(
                (selectedCategory.spent /
                  selectedCategory.allocated) *
                  100
              )}
              %
            </strong>
          </div>

          {/* DETAILS MODE */}
          {panelMode === "details" && (
            <div className="details-content">
              <section className="panel-section">
                <div className="panel-section-heading">
                  <h3>Budget Details</h3>

                  <button
                    className="icon-button"
                    type="button"
                    onClick={budgetEditMode ? saveBudgetEdits : beginBudgetEdit}
                    aria-label={budgetEditMode ? "Save budget limits" : "Edit budget limits"}
                  >
                    {budgetEditMode ? "✓" : "✎"}
                  </button>
                </div>

                <div className="form-grid">
                  <div>
                    <label>Monthly Budget</label>

                    {budgetEditMode ? (
                      <div className="fake-input">
                        <span>₹</span>
                        <input
                          type="number"
                          min="0"
                          value={draftAllocated}
                          onChange={(event) => setDraftAllocated(event.target.value)}
                          aria-label="Monthly category budget"
                        />
                      </div>
                    ) : (
                      <div className="fake-input">
                        <span>₹</span>
                        {selectedCategory.allocated.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>

                  <div>
                    <label>Budget Period</label>

                    {budgetEditMode ? (
                      <div className="fake-input">
                        <span>₹</span>
                        <input
                          type="number"
                          min="1"
                          value={draftMonthlyBudget}
                          onChange={(event) => setDraftMonthlyBudget(event.target.value)}
                          aria-label="Total monthly budget"
                        />
                      </div>
                    ) : (
                      <div className="fake-input">
                        Monthly
                        <span>⌄</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {budgetEditMode && (
                <div className="budget-edit-actions">
                  <button type="button" onClick={() => setBudgetEditMode(false)}>Cancel</button>
                  <button type="button" onClick={saveBudgetEdits}>Save budget</button>
                </div>
              )}

              <section className="panel-section">
                <h3>Budget Controls</h3>

                <div className="control-row">
                  <div className="control-icon">
                    ◉
                  </div>

                  <div className="control-text">
                    <strong>Overspending alert</strong>
                    <span>
                      Notify me when spending reaches
                    </span>
                  </div>

                  <select defaultValue="80%">
                    <option>70%</option>
                    <option>80%</option>
                    <option>90%</option>
                    <option>100%</option>
                  </select>

                  <div className="toggle active" />
                </div>

                <div className="control-row">
                  <div className="control-icon">
                    ◌
                  </div>

                  <div className="control-text">
                    <strong>
                      Carry forward unused amount
                    </strong>
                    <span>
                      Unused amount will be carried to next
                      month
                    </span>
                  </div>

                  <div className="toggle active" />
                </div>
              </section>

              {/*<section className="panel-section">
                <h3>Spending Progress</h3>

                <div className="spending-box">
                  <div>
                    <span>Budget</span>
                    <strong>
                      {formatCurrency(
                        selectedCategory.allocated
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Spent</span>
                    <strong>
                      {formatCurrency(
                        selectedCategory.spent
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Remaining</span>
                    <strong className="green-text">
                      {formatCurrency(
                        selectedCategory.allocated -
                          selectedCategory.spent
                      )}
                    </strong>
                  </div>

                 <div className="large-progress">
                    <div
                      style={{
                        width: `${(selectedCategory.spent /selectedCategory.allocated) * 100}%`,
                      }}
                    />
                  </div>
                </div> 
              </section>*/}

              <section className="panel-section">
                <h3>Spent by Members</h3>

                <div className="members-list">
                  {members.map((member) => (
                    <div
                      className="member-row"
                      key={member.name}
                    >
                      <div className="member-avatar">
                        {member.initial}
                      </div>

                      <div className="member-info">
                        <div>
                          <strong>{member.name}</strong>
                          <span>
                            {formatCurrency(member.amount)}
                          </span>
                        </div>

                        <div className="member-progress">
                          <div
                            style={{
                              width: `${member.percent}%`,
                            }}
                          />
                        </div>
                      </div>

                      <span className="member-percent">
                        {member.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* SUBCATEGORY MODE */}
          {panelMode === "subcategories" && (
            <div className="subcategory-content">
              <div className="subcategory-heading">
                <div>
                  <h3>Subcategories</h3>
                  <p>
                    Track spending within{" "}
                    {selectedCategory.name}
                  </p>
                </div>

                <button className="add-subcategory">
                  ＋ Add
                </button>
              </div>

              <div className="subcategory-list">
                {selectedCategory.subcategories.map(
                  (sub) => {
                    const percentage = Math.round(
                      (sub.spent / sub.budget) * 100
                    );

                    return (
                      <div
                        className="subcategory-item"
                        key={sub.name}
                      >
                        <div
                          className={`subcategory-icon ${sub.color}`}
                        >
                          {sub.name.charAt(0)}
                        </div>

                        <div className="subcategory-info">
                          <div className="subcategory-title">
                            <strong>{sub.name}</strong>

                            <button className="edit-subcategory">
                              ✎
                            </button>
                          </div>

                          <span>
                            {formatCurrency(sub.spent)} of{" "}
                            {formatCurrency(sub.budget)}
                          </span>

                          <div className="subcategory-progress">
                            <div
                              className={`progress-fill ${sub.color}`}
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <strong className="subcategory-percent">
                          {percentage}%
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>

              <button className="full-add-subcategory">
                ＋ Add Subcategory
              </button>
            </div>
          )}

          <div className="panel-footer">
            <button
              className="cancel-button"
              onClick={closePanel}
            >
              Cancel
            </button>

            <button className="save-button">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;