import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`main-content ${collapsed ? "expanded" : ""}`}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;