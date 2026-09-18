import React, { useState } from "react";
import "../Styles/BudgetCategories.css";

const categories = [
  {
    name: "Home & Utilities",
    icon: "⌂",
    color: "purple",
    allocated: 25000,
    spent: 20000,
    subcategories: [
      { name: "Rent / EMI", spent: 12000, budget: 20000, color: "purple" },
      { name: "Electricity", spent: 950, budget: 1500, color: "orange" },
      { name: "Water", spent: 500, budget: 800, color: "blue" },
      { name: "Internet", spent: 600, budget: 1200, color: "green" },
      { name: "Mobile", spent: 300, budget: 1000, color: "purple" },
      { name: "Household", spent: 900, budget: 2000, color: "pink" },
      { name: "Maintenance", spent: 750, budget: 1500, color: "purple" },
    ],
  },
  {
    name: "Food & Groceries",
    icon: "🛒",
    color: "green",
    allocated: 16000,
    spent: 12500,
    subcategories: [
      { name: "Groceries", spent: 8000, budget: 10000, color: "green" },
      { name: "Dining Out", spent: 3000, budget: 4000, color: "orange" },
      { name: "Snacks", spent: 1500, budget: 2000, color: "pink" },
    ],
  },
  {
    name: "Transport",
    icon: "🚗",
    color: "blue",
    allocated: 8000,
    spent: 3200,
    subcategories: [
      { name: "Fuel", spent: 1800, budget: 3000, color: "blue" },
      { name: "Cab", spent: 900, budget: 1500, color: "purple" },
      { name: "Public Transport", spent: 500, budget: 1000, color: "green" },
    ],
  },
  {
    name: "Health",
    icon: "♥",
    color: "pink",
    allocated: 6000,
    spent: 2400,
    subcategories: [
      { name: "Medicines", spent: 1200, budget: 2500, color: "pink" },
      { name: "Doctor", spent: 800, budget: 2000, color: "red" },
      { name: "Fitness", spent: 400, budget: 1500, color: "green" },
    ],
  },
  {
    name: "Education & Kids",
    icon: "🎓",
    color: "orange",
    allocated: 10000,
    spent: 7000,
    subcategories: [
      { name: "School Fees", spent: 5000, budget: 6000, color: "orange" },
      { name: "Books", spent: 1200, budget: 2000, color: "purple" },
      { name: "Activities", spent: 800, budget: 2000, color: "blue" },
    ],
  },
  {
    name: "Entertainment",
    icon: "▣",
    color: "purple",
    allocated: 6000,
    spent: 3600,
    subcategories: [
      { name: "Movies", spent: 1200, budget: 2000, color: "purple" },
      { name: "Subscriptions", spent: 1500, budget: 2000, color: "blue" },
      { name: "Events", spent: 900, budget: 2000, color: "pink" },
    ],
  },
  {
    name: "Finance & Others",
    icon: "▰",
    color: "teal",
    allocated: 10000,
    spent: 5400,
    subcategories: [
      { name: "Insurance", spent: 2500, budget: 4000, color: "teal" },
      { name: "Investments", spent: 2000, budget: 4000, color: "green" },
      { name: "Other", spent: 900, budget: 2000, color: "purple" },
    ],
  },
];

const members = [
  { name: "Rohini (You)", amount: 10000, percent: 50, initial: "R" },
  { name: "Varun", amount: 6000, percent: 30, initial: "V" },
  { name: "Meera", amount: 4000, percent: 20, initial: "M" },
];

const formatCurrency = (value) =>
  `₹${value.toLocaleString("en-IN")}`;

function Budgets() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [panelMode, setPanelMode] = useState("details");

  const totalBudget = 80000;
  const totalAllocated = 79000;
  const remaining = totalBudget - totalAllocated;

  const openPanel = (category, mode) => {
    setSelectedCategory(category);
    setPanelMode(mode);
  };

  const closePanel = () => {
    setSelectedCategory(null);
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

                  <button className="icon-button">
                    ✎
                  </button>
                </div>

                <div className="form-grid">
                  <div>
                    <label>Monthly Budget</label>

                    <div className="fake-input">
                      <span>₹</span>
                      {selectedCategory.allocated.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>

                  <div>
                    <label>Budget Period</label>

                    <div className="fake-input">
                      Monthly
                      <span>⌄</span>
                    </div>
                  </div>
                </div>
              </section>

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