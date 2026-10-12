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

  const handleSubmit = (event) => {
    event.preventDefault();

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

    const savedItem = {
      ...formData,
      productName: formData.productName.trim(),
      quantity: formData.quantity.trim(),
      notes: formData.notes.trim(),
      id: editingItemId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };

    setItems((current) =>
      editingItemId
        ? current.map((item) => (item.id === editingItemId ? savedItem : item))
        : [savedItem, ...current],
    );
    closeForm();
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
          <h1>Home &amp; Essentials</h1>
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
              <span>Category</span>
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
            >
              {editingItemId ? "Save changes" : "Save item"}
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
                  <th scope="col">Category</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Purchased date</th>
                  <th scope="col">Expiry date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="home-essentials-actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getExpiryStatus(item.expiryDate);

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