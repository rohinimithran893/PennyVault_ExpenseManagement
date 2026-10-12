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
  isSavingTransaction,
  cancelEdit,
  householdMembers = [],
  assignmentMode = "ONE_MEMBER",
  setAssignmentMode = () => {},
  selectedMemberIds = [],
  setSelectedMemberIds = () => {},
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
          <button type="button" className={`paid-option ${assignmentMode === "ONE_MEMBER" ? "active" : ""}`}
            onClick={() => { setAssignmentMode("ONE_MEMBER"); setSelectedMemberIds((ids) => ids.length ? [ids[0]] : []); }}>
            <IconUsers size={18} /> One member
          </button>
          <button type="button" className={`paid-option ${assignmentMode === "SPLIT_EQUALLY" ? "active" : ""}`}
            onClick={() => setAssignmentMode("SPLIT_EQUALLY")}>
            <IconUsers size={18} /> Split equally
          </button>
        </div>
      </div>

      <div className="transaction-form">
        <div className="form-field member-assignment-field">
          <label>{assignmentMode === "ONE_MEMBER" ? "Assign to member" : "Split equally between"}</label>
          {assignmentMode === "ONE_MEMBER" ? (
            <select value={selectedMemberIds[0] ?? ""} onChange={(e) => { setSelectedMemberIds(e.target.value ? [Number(e.target.value)] : []); setFormErrors((errors) => ({ ...errors, members: "" })); }}>
              <option value="">Select household member</option>
              {householdMembers.map((member) => <option key={member.id} value={member.id}>{member.fullName}{member.currentUser ? " (You)" : ""}</option>)}
            </select>
          ) : (
            <div className="household-member-options">
              {householdMembers.map((member) => (
                <label key={member.id} className="household-member-option">
                  <input type="checkbox" checked={selectedMemberIds.includes(member.id)} onChange={(e) => { setSelectedMemberIds((ids) => e.target.checked ? [...ids, member.id] : ids.filter((id) => id !== member.id)); setFormErrors((errors) => ({ ...errors, members: "" })); }} />
                  <span>{member.fullName}{member.currentUser ? " (You)" : ""}</span>
                </label>
              ))}
            </div>
          )}
          {assignmentMode === "SPLIT_EQUALLY" && selectedMemberIds.length > 0 && Number(amount) > 0 && <small>Each share: ₹{(Math.floor((Number(amount) * 100) / selectedMemberIds.length) / 100).toFixed(2)} approx.</small>}
          {formErrors.members && <span className="field-error">{formErrors.members}</span>}
          {householdMembers.length === 0 && <span className="field-error">No household members loaded. Please refresh or check the backend.</span>}
        </div>

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
              disabled={isSavingTransaction}
            >
              {isSavingTransaction
                ? editingTransactionId
                  ? "Updating..."
                  : "Saving..."
                : editingTransactionId
                  ? "Update transaction"
                  : "Save transaction"}
            </button>

            <button
              type="button"
              className="transaction-cancel-button"
              onClick={cancelEdit}
              disabled={isSavingTransaction}
            >
              Cancel
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default TransactionForm;