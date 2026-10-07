import React from "react";
import {
  IconPencil,
  IconUsers,
  IconArrowDown,
  IconArrowUp,
} from "@tabler/icons-react";

function TransactionForm({
  isAddTransactionOpen,
  editingTransactionId,
  transactionDate,
  setTransactionDate,
  accountId,
  setAccountId,
  accounts,
  description,
  setDescription,
  categoryId,
  setCategoryId,
  categories,
  subcategoryId,
  setSubcategoryId,
  subcategories,
  amount,
  setAmount,
  transactionType,
  setTransactionType,
  formErrors,
  setFormErrors,
  clearForm,
  saveTransaction,
  cancelEdit,
}) {
  if (!isAddTransactionOpen) {
    return null;
  }

  return (
    <div className="add-transaction-card">
      <div className="add-transaction-header">
        <div className="add-title">
          <div className="add-icon">
            <IconPencil size={20} />
          </div>

          <h2>
            {editingTransactionId
              ? "Edit transaction"
              : "Add new transaction"}
          </h2>
        </div>

        <div className="paid-options">
          <button type="button" className="paid-option active">
            <IconUsers size={18} />
            One member
          </button>

          <button type="button" className="paid-option">
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
              className={
                formErrors.transactionDate ? "input-error" : ""
              }
              onChange={(e) => {
                setTransactionDate(e.target.value);

                if (formErrors.transactionDate) {
                  setFormErrors((currentErrors) => ({
                    ...currentErrors,
                    transactionDate: "",
                  }));
                }
              }}
            />

            {formErrors.transactionDate && (
              <span className="field-error">
                {formErrors.transactionDate}
              </span>
            )}
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="form-field">
          <label>Account</label>

          <select
            value={accountId}
            className={formErrors.accountId ? "input-error" : ""}
            onChange={(e) => {
              setAccountId(e.target.value);

              if (formErrors.accountId) {
                setFormErrors((currentErrors) => ({
                  ...currentErrors,
                  accountId: "",
                }));
              }
            }}
          >
            <option value="">Select account</option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountName}
              </option>
            ))}
          </select>

          {formErrors.accountId && (
            <span className="field-error">
              {formErrors.accountId}
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="form-field">
          <label>Description</label>

          <input
            type="text"
            placeholder="e.g. Swiggy order"
            value={description}
            className={
              formErrors.description ? "input-error" : ""
            }
            onChange={(e) => {
              setDescription(e.target.value);

              if (formErrors.description) {
                setFormErrors((currentErrors) => ({
                  ...currentErrors,
                  description: "",
                }));
              }
            }}
          />

          {formErrors.description && (
            <span className="field-error">
              {formErrors.description}
            </span>
          )}
        </div>

        {/* CATEGORY */}
        <div className="form-field">
          <label>Category</label>

          <select
            value={categoryId}
            className={formErrors.categoryId ? "input-error" : ""}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId("");

              setFormErrors((currentErrors) => ({
                ...currentErrors,
                categoryId: "",
                subcategoryId: "",
              }));
            }}
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {formErrors.categoryId && (
            <span className="field-error">
              {formErrors.categoryId}
            </span>
          )}
        </div>

        {/* SUBCATEGORY */}
        <div className="form-field">
          <label>Subcategory</label>

          <select
            value={subcategoryId}
            className={
              formErrors.subcategoryId ? "input-error" : ""
            }
            onChange={(e) => {
              setSubcategoryId(e.target.value);

              if (formErrors.subcategoryId) {
                setFormErrors((currentErrors) => ({
                  ...currentErrors,
                  subcategoryId: "",
                }));
              }
            }}
            disabled={!categoryId}
          >
            <option value="">
              {categoryId
                ? "Select subcategory"
                : "Select category first"}
            </option>

            {subcategories.map((subcategory) => (
              <option
                key={subcategory.id}
                value={subcategory.id}
              >
                {subcategory.name}
              </option>
            ))}
          </select>

          {formErrors.subcategoryId && (
            <span className="field-error">
              {formErrors.subcategoryId}
            </span>
          )}
        </div>

        {/* AMOUNT */}
        <div className="form-field">
          <label>Amount (₹)</label>

          <input
            type="text"
            placeholder="0.00"
            value={amount}
            className={formErrors.amount ? "input-error" : ""}
            onChange={(e) => {
              const value = e.target.value;

              // Allow only digits and one decimal point.
              if (!/^\d*\.?\d*$/.test(value)) {
                return;
              }

              setAmount(value);

              if (formErrors.amount) {
                setFormErrors((currentErrors) => ({
                  ...currentErrors,
                  amount: "",
                }));
              }
            }}
          />
        </div>
      </div>

      {/* TYPE + ACTIONS */}
      <div className="transaction-form-footer">

        <div className="type-section">
          <label>Type</label>

          <div className="type-buttons">

            <button
              type="button"
              className={`type-button ${
                transactionType === "debit"
                  ? "selected debit"
                  : ""
              }`}
              onClick={() => setTransactionType("debit")}
            >
              <IconArrowDown size={18} />
              Debit
            </button>

            <button
              type="button"
              className={`type-button ${
                transactionType === "credit"
                  ? "selected credit"
                  : ""
              }`}
              onClick={() => setTransactionType("credit")}
            >
              <IconArrowUp size={18} />
              Credit
            </button>

          </div>
        </div>

        <div className="form-actions">

          <button
            type="button"
            className="clear-button"
            onClick={clearForm}
          >
            Clear
          </button>

          <div className="transaction-form-actions">

            <button
              type="button"
              className="save-button"
              onClick={saveTransaction}
            >
              {editingTransactionId
                ? "Update transaction"
                : "Save transaction"}
            </button>

            {editingTransactionId && (
              <button
                type="button"
                className="transaction-cancel-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default TransactionForm;