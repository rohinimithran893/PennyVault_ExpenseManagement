import React from "react";
import "../Styles/Sidebar.css";
import { NavLink } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconReceipt,
  IconWallet,
  IconChartPie,
  IconUsers,
  IconSettings,
  IconChevronsLeft,
  IconChevronsRight,
  IconBell,
  IconHelpCircle,
  IconMail,
  IconCreditCard,
  IconTarget,
  IconRefresh,
  IconShieldLock,
  IconArrowsExchange,
  IconReportAnalytics,
  IconDotsVertical,
} from "@tabler/icons-react";

const menuItems = [
  { label: "Dashboard", icon: IconLayoutDashboard, path: "/"},  
];

const financeItems = [
    { label: "Transactions", icon: IconArrowsExchange, path: "/transactions", badge: "12",},
    { label: "Budgets", icon: IconWallet, path: "/budget-categories", },
    { label: "Reports", icon: IconReportAnalytics, path: "/reports"},
    { label: "Messages", icon: IconMail, path: "/messages", badge: 4},
];

const manageItems = [
    { label: "Accounts", icon: IconCreditCard, path: "/accounts"},
    { label: "Goals", icon: IconTarget, path: "/goals"},
    { label: "Recurring", icon: IconRefresh, path: "/recurring"},
    { label: "Bills", icon: IconReceipt, path: "/bills"},
    { label: "People & Access", icon: IconUsers, path: "/members"},   
]

const bottomItems = [
  { label: "Notifications", icon: IconBell, path: "/notifications", dot:true},
  { label: "Preferences", icon: IconSettings, path: "/preferences" },
  { label: "Security", icon: IconShieldLock , path: "/security" },
  { label: "Help & Support", icon: IconHelpCircle, path: "/help" },
];

function NavSection({ title, items, collapsed, className = "" }) {
  return (
    <div className={`nav-section ${className}`.trim()}>
      {!collapsed && <span className="nav-section-title">{title}</span>}

      {items.map((item) => {
        const Icon = item.icon;

        return (
           <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            title={collapsed ? item.label : ""}
          >
            <span className="nav-icon">
              <Icon size={21} stroke={1.8} />
            </span>

            {!collapsed && (
              <>
                <span className="nav-label">{item.label}</span>

                {item.badge && <span className="nav-badge">{item.badge}</span>}
                {item.dot && <span className="nav-dot" />}
              </>
            )}
            </NavLink>
        );
      })}
    </div>
  );
}

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-logo">P</div>

          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">PennyVault</span>
              <span className="brand-subtitle">Expense Manager</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronsRight size={16}/> : <IconChevronsLeft size={16}/>}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Overview */}
        <NavSection title="Overview" items={menuItems} collapsed={collapsed} />
        {/* Finance */}
        <NavSection title="Finance" items={financeItems} collapsed={collapsed} />
        {/* Manage */}
        <NavSection title="Manage" items={manageItems} collapsed={collapsed} />
        {/* Settings */}
        <NavSection title="Settings" items={bottomItems} collapsed={collapsed} className="nav-section-bottom"/>
      </nav>

      <div className="sidebar-profile">
        <div className="profile-left">
        <div className="profile-avatar">R</div>

        {!collapsed && (
            <div className="profile-info">
              <span className="profile-name">Rohini</span>
              <span className="profile-role">Administrator</span>
            </div>
          )}
        </div>

        {!collapsed && (
           <button className="profile-menu-btn" aria-label="Profile options">
            <IconDotsVertical size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
export default Sidebar;