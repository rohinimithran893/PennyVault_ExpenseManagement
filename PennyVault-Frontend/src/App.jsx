import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import Transactions from "./pages/Transactions";
import BudgetCategories from "./pages/BudgetCategories";
import Reports from "./pages/ReportPages";
import Messages from "./pages/Messages";
import Accounts from "./pages/Accounts";
import Goals from "./pages/Goals";
import Recurring from "./pages/Recurring";
import Bills from "./pages/BillsPage";
import PeopleAccess from "./pages/PeopleAccess";
import Notifications from "./pages/Notifications";
import Preferences from "./pages/Preferences";
import Security from "./pages/Security";
import HelpAndSupport from "./pages/HelpAndSupport";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />}/>
        <Route path="/transactions" element={ <Transactions />} />
        <Route path="/budget-categories" element={<BudgetCategories />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/recurring" element={<Recurring />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/peopleAccess" element={<PeopleAccess />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/security" element={<Security />} />
        <Route path="/helpAndSupport" element={<HelpAndSupport />} />
        </Route>     
      </Routes>
    </BrowserRouter>
  );
}

export default App;