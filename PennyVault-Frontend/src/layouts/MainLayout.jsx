import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`main-content ${collapsed ? "expanded" : ""}`}>
        <Outlet/>
      </main>
    </div>
  );
}

export default MainLayout;