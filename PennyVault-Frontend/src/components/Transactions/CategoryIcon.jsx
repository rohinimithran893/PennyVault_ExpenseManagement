import React from "react";
import {
  IconShoppingCart,
  IconHome,
  IconToolsKitchen2,
  IconCar,
  IconHeart,
  IconSchool,
  IconReceiptTax,
  IconChartBar,
  IconDots,
  IconTag,
  IconPaw,
  IconGift,
  IconMovie,
  IconArrowsLeftRight,
  IconRepeat,
  IconMusic,
  IconPlane,
  IconBriefcase,
  IconHeartbeat,
} from "@tabler/icons-react";

function normalizeCategoryName(categoryName) {
  return String(categoryName || "").trim().toLowerCase();
}

const categoryIconMap = {
  "food & groceries": { icon: IconShoppingCart, tone: "pink" },
  groceries: { icon: IconShoppingCart, tone: "pink" },
  shopping: { icon: IconShoppingCart, tone: "pink" },
  "home & utilities": { icon: IconHome, tone: "blue" },
  "housing & utilities": { icon: IconHome, tone: "blue" },
  housing: { icon: IconHome, tone: "blue" },
  "food & dining": { icon: IconToolsKitchen2, tone: "green" },
  dining: { icon: IconToolsKitchen2, tone: "green" },
  "transport & travel": { icon: IconCar, tone: "orange" },
  transport: { icon: IconCar, tone: "orange" },
  travel: { icon: IconPlane, tone: "orange" },
  "health & medical": { icon: IconHeartbeat, tone: "teal" },
  "health & wellness": { icon: IconHeartbeat, tone: "teal" },
  "personal care": { icon: IconHeart, tone: "pink" },
  health: { icon: IconHeartbeat, tone: "teal" },
  "education & kids": { icon: IconSchool, tone: "purple" },
  education: { icon: IconSchool, tone: "purple" },
  "taxes & government": { icon: IconReceiptTax, tone: "blue" },
  "finance & investments": { icon: IconChartBar, tone: "green" },
  "finance & others": { icon: IconChartBar, tone: "green" },
  pets: { icon: IconPaw, tone: "pink" },
  "gifts & donation": { icon: IconGift, tone: "purple" },
  "gifts & donations": { icon: IconGift, tone: "purple" },
  "gifts and donation": { icon: IconGift, tone: "purple" },
  entertainment: { icon: IconMovie, tone: "orange" },
  transfers: { icon: IconArrowsLeftRight, tone: "blue" },
  subscriptions: { icon: IconRepeat, tone: "teal" },
  music: { icon: IconMusic, tone: "purple" },
  business: { icon: IconBriefcase, tone: "blue" },
  "work & business": { icon: IconBriefcase, tone: "blue" },
  others: { icon: IconDots, tone: "neutral" },
};

export function getCategoryIcon(categoryName) {
  return categoryIconMap[normalizeCategoryName(categoryName)]?.icon || IconTag;
}

export function getCategoryIconTone(categoryName) {
  return categoryIconMap[normalizeCategoryName(categoryName)]?.tone || "neutral";
}

export default function CategoryIcon({ categoryName }) {
  const Icon = getCategoryIcon(categoryName);
  const tone = getCategoryIconTone(categoryName);

  return (
    <span className={`category-icon ${tone}`} aria-hidden="true">
      <Icon size={18} stroke={1.8} />
    </span>
  );
}
