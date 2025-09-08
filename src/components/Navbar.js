import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaExchangeAlt, FaWallet, FaSignOutAlt, FaSyncAlt, FaCog } from "react-icons/fa";
import "./Navbar.css";
import NotificationBadge from "../pages/NotificationBadge";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Call the onLogout callback to cleanup Firebase
      if (onLogout) {
        await onLogout();
      }
      
      // Navigate to login page
      navigate("/");
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate even if there's an error
      navigate("/");
    }
  };

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
        
        {/* Modified Settings Link with Notification Badge */}
        <Link to="/settings" className={isActive("/settings")}>
          <div className="settings-with-bell">
            <FaCog />
            <NotificationBadge />
          </div>
          <span>SETTINGS</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;