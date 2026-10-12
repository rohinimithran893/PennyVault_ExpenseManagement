import { getUser } from "./auth";

export const DEFAULT_BUDGET_CATEGORIES = [
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
];;

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
  try {
    const saved = window.localStorage.getItem(getBudgetPlanStorageKey());
    if (!saved) {
      return { monthlyBudget: 80000, categories: DEFAULT_BUDGET_CATEGORIES };
    }
    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.categories)) {
      return { monthlyBudget: 80000, categories: DEFAULT_BUDGET_CATEGORIES };
    }
    return {
      monthlyBudget: Number(parsed.monthlyBudget) > 0 ? Number(parsed.monthlyBudget) : 80000,
      categories: parsed.categories,
    };
  } catch {
    return { monthlyBudget: 80000, categories: DEFAULT_BUDGET_CATEGORIES };
  }
};

export const saveBudgetPlan = (plan) => {
  try {
    window.localStorage.setItem(getBudgetPlanStorageKey(), JSON.stringify(plan));
  } catch {
    // Browser storage may be unavailable or full; keep this UI session usable.
  }
};
