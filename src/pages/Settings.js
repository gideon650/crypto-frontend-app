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
        <Link to="/FAQ" className="settings-item">
          <FaRegLightbulb />
          <div className="settings-item-text">
            <span className="settings-item-title">FAQs</span>
            <span className="settings-item-description">
              {getDescription("Frequently Asked Questions", "FAQs")}
            </span>
          </div>
        </Link>
      </div>
      </div>
  );
};

export default Settings;
