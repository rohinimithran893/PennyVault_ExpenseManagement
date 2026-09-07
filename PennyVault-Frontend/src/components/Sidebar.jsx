import React, { useState, useEffect, useRef } from "react";
import "../Styles/Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import {
  IconLayoutDashboard,
  IconReceipt,
  IconWallet,
  IconUsers,
  IconSettings,
  IconChevronsLeft,
  IconChevronsRight,
  IconBell,
  IconHelpCircle,
  IconMail,
  IconKey,
  IconLogout,
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
    { label: "Reports", icon: IconReportAnalytics, path: "/reports",},
    { label: "Messages", icon: IconMail, path: "/messages", badge: 4,},
];

const manageItems = [
    { label: "Accounts", icon: IconCreditCard, path: "/accounts",},
    { label: "Goals", icon: IconTarget, path: "/goals",},
    { label: "Recurring", icon: IconRefresh, path: "/recurring",},
    { label: "Bills", icon: IconReceipt, path: "/bills",},
    { label: "People & Access", icon: IconUsers, path: "/peopleAccess",},   
];

const bottomItems = [
  { label: "Notifications", icon: IconBell, path: "/notifications", dot:true},
  { label: "Preferences", icon: IconSettings, path: "/preferences", },
  { label: "Security", icon: IconShieldLock , path: "/security", },
  { label: "Help & Support", icon: IconHelpCircle, path: "/helpAndSupport", },
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
  const navigate = useNavigate();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <div className="profile-avatar">{user?.fullName?.charAt(0) || "U"}</div>

        {!collapsed && (
            <div className="profile-info">
              <span className="profile-name">{user?.fullName || "User"}</span>
              <span className="profile-role">{user?.role || "Member"}</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="profile-menu-wrapper">
            <button
              ref={menuButtonRef}
              className="profile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <IconDotsVertical size={18} />
            </button>

            {menuOpen && (
              <div ref={menuRef} className="profile-dropdown">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/preferences");
                  }}
                >
                  <IconUsers size={16} />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/security");
                  }}
                >
                  <IconKey size={16} />
                  Change Password
                </button>

                <button
                  className="logout-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <IconLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-icon">
              <IconLogout size={28}/>
            </div>
            <h3>Logout from PennyVault?</h3>
            <p>
              You'll need to sign in again to access your household finances.
            </p>
            <div className="logout-actions">
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="confirm-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;