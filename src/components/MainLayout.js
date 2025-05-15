import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Trade from "../pages/Trade";
import Wallet from "../pages/Wallet";
import Swap from '../pages/Swap';
import Navbar from "./Navbar";
import Auth from "../pages/Auth";
import Settings from "../pages/Settings";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/profile";
import About from "../pages/about";
import FAQ from "../pages/FAQ";

const MainLayout = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const showNavbar = token && !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trade" element={<PrivateRoute><Trade /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/swap" element={<PrivateRoute><Swap /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
        <Route path="/FAQ" element={<PrivateRoute><FAQ /></PrivateRoute>} />
      </Routes>
    </div>
  );
};

export default MainLayout;  // ✅ Export default properly

