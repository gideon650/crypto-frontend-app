import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaExchangeAlt, FaWallet, FaSignOutAlt, FaSyncAlt, FaCog } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Check if current path matches the link
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <>
      {/* Logout Button at Top Right */}
      <button className="logout-button" onClick={handleLogout}>
        <FaSignOutAlt /> <span>Logout</span>
      </button>

      <nav className="navbar">
        <Link to="/dashboard" className={isActive("/dashboard")}><FaHome /> <span>HOME</span></Link>
        <Link to="/trade" className={isActive("/trade")}><FaExchangeAlt /> <span>CHARTS</span></Link>
        <Link to="/swap" className={isActive("/swap")}><FaSyncAlt /> <span>SWAP</span></Link>
        <Link to="/wallet" className={isActive("/wallet")}><FaWallet /> <span>ASSETS</span></Link>
        <Link to="/settings" className={isActive("/settings")}><FaCog /> <span>SETTINGS</span></Link>
      </nav>
    </>
  );
};

export default Navbar;