import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./utils/auth";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import Transaction from "./pages/Transaction";
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

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page (NO Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Pages */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={ <Transaction/>} />
          <Route path="/budget-categories" element={<BudgetCategories />} />
          <Route path="/reports" element={<Reports /> } />
          <Route path="/messages" element={<Messages /> } />
          <Route path="/accounts" element={<Accounts /> } />
          <Route path="/goals" element={ <Goals /> } />
          <Route path="/recurring" element={<Recurring /> } />
          <Route path="/bills" element={<Bills/> } />
          <Route path="/peopleAccess" element={ <PeopleAccess /> } />
          <Route path="/notifications" element={ <Notifications /> } />
          <Route path="/preferences" element={ <Preferences /> } />
          <Route path="/security" element={ <Security /> } />
          <Route path="/helpAndSupport" element={<HelpAndSupport/> } />
        </Route>     
      </Routes>
    </BrowserRouter>
  );
}

export default App;