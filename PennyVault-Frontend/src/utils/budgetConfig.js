import { getUser } from "./auth";

const DEFAULT_CATEGORY_BUDGETS = {
  "home & utilities": 25000,
  "food & groceries": 16000,
  transport: 8000,
  health: 6000,
  "education & kids": 10000,
  entertainment: 6000,
  "finance & others": 9000,
};

const DEFAULT_SUBCATEGORY_BUDGETS = {
  "rent / emi": 17000,
  electricity: 1500,
  water: 800,
  internet: 1200,
  mobile: 1000,
  household: 2000,
  maintenance: 1500,
  groceries: 10000,
  "dining out": 4000,
  snacks: 2000,
  fuel: 3000,
  cab: 1500,
  "public transport": 1000,
  medicines: 2500,
  doctor: 2000,
  fitness: 1500,
  "school fees": 6000,
  books: 2000,
  activities: 2000,
  movies: 2000,
  subscriptions: 2000,
  events: 2000,
  insurance: 3500,
  investments: 3500,
  other: 2000,
};

const normaliseName = (value) => String(value ?? "").trim().toLowerCase();

export const getBudgetPlanStorageKey = () => {
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

  return `pennyvault:budget-plan:${safeIdentity}`;
};

export const readBudgetPlan = () => {
  const defaults = {
    monthlyBudget: 80000,
    categoryBudgets: {},
    subcategoryBudgets: {},
  };

  try {
    const saved = window.localStorage.getItem(getBudgetPlanStorageKey());
    if (!saved) return defaults;

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return defaults;

    return {
      monthlyBudget:
        Number(parsed.monthlyBudget) > 0
          ? Number(parsed.monthlyBudget)
          : defaults.monthlyBudget,
      categoryBudgets:
        parsed.categoryBudgets && typeof parsed.categoryBudgets === "object"
          ? parsed.categoryBudgets
          : {},
      subcategoryBudgets:
        parsed.subcategoryBudgets && typeof parsed.subcategoryBudgets === "object"
          ? parsed.subcategoryBudgets
          : {},
    };
  } catch {
    return defaults;
  }
};

export const saveBudgetPlan = (plan) => {
  try {
    window.localStorage.setItem(getBudgetPlanStorageKey(), JSON.stringify(plan));
  } catch {
    // Browser storage may be unavailable or full; keep this UI session usable.
  }
};

export const getCategoryBudgetLimit = (plan, categoryId, categoryName) => {
  const key = String(categoryId ?? "");
  const configured = plan?.categoryBudgets ?? {};
  if (Object.prototype.hasOwnProperty.call(configured, key)) {
    return Math.max(0, Number(configured[key]) || 0);
  }
  return DEFAULT_CATEGORY_BUDGETS[normaliseName(categoryName)] ?? 0;
};

export const getSubcategoryBudgetLimit = (plan, subcategoryId, subcategoryName) => {
  const key = String(subcategoryId ?? "");
  const configured = plan?.subcategoryBudgets ?? {};
  if (Object.prototype.hasOwnProperty.call(configured, key)) {
    return Math.max(0, Number(configured[key]) || 0);
  }
  return DEFAULT_SUBCATEGORY_BUDGETS[normaliseName(subcategoryName)] ?? 0;
};