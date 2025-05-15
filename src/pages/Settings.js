import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaQuestionCircle, FaRocketchat, FaUserCircle, FaInfoCircle, FaBook, FaRegLightbulb } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Shorter descriptions for mobile
  const getDescription = (longDesc, shortDesc) => {
    return windowWidth <= 360 ? shortDesc : longDesc;
  };

  // Handlers for About and FAQs
  const handleAboutClick = (e) => {
    e.preventDefault();
    alert("About: This app is powered by Amalu. Swap, manage, and grow your crypto portfolio easily.");
  };

  const handleFAQsClick = (e) => {
    e.preventDefault();
    alert("FAQs: Frequently Asked Questions will be available soon.");
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>SETTINGS</h2>
        <p>{windowWidth <= 360 ? "Manage your account" : "Customize your experience and manage your account"}</p>
      </div>

      <div className="settings-options">
        <Link to="/profile" className="settings-item">
          <FaUserCircle />
          <div className="settings-item-text">
            <span className="settings-item-title">Profile</span>
            <span className="settings-item-description">
              {getDescription("Manage your personal information", "Personal info")}
            </span>
          </div>
        </Link>

        <a href="mailto:support@yourapp.com" className="settings-item">
          <FaQuestionCircle />
          <div className="settings-item-text">
            <span className="settings-item-title">Contact Support</span>
            <span className="settings-item-description">
              {getDescription("Get help with any issues", "Get help")}
            </span>
          </div>
        </a>

        <a href="https://t.me/Swapview" target="_blank" rel="noopener noreferrer" className="settings-item">
          <FaRocketchat />
          <div className="settings-item-text">
            <span className="settings-item-title">What's New</span>
            <span className="settings-item-description">
              {getDescription("Latest updates and features", "Latest updates")}
            </span>
          </div>
        </a>

        {/* About Button */}
        <Link to="/about" className="settings-item">
          <FaBook />
          <div className="settings-item-text">
            <span className="settings-item-title">About</span>
            <span className="settings-item-description">
              {getDescription("Learn more about this app", "About app")}
            </span>
          </div>
        </Link>

        {/* FAQs Button */}
        <button className="settings-item" onClick={handleFAQsClick}>
          <FaRegLightbulb />
          <div className="settings-item-text">
            <span className="settings-item-title">FAQs</span>
            <span className="settings-item-description">
              {getDescription("Frequently Asked Questions", "FAQs")}
            </span>
          </div>
        </button>
      </div>
      </div>
  );
};

export default Settings;
