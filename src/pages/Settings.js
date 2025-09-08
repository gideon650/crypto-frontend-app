import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaQuestionCircle, 
  FaRocketchat, 
  FaUserCircle, 
  FaInfoCircle, 
  FaBook, 
  FaRegLightbulb, 
  FaEnvelope,
  FaPlusCircle,
  FaStore,
  FaBell
} from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [starRating, setStarRating] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const fetchStarRating = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        const balance = response.data.balance_usd;
        // Calculate star rating based on balance
        if (balance >= 5000) setStarRating(5);
        else if (balance >= 1000) setStarRating(4);
        else if (balance >= 301) setStarRating(3);
        else if (balance >= 101) setStarRating(2);
        else setStarRating(1);
      } catch (error) {
        console.error("Error fetching star rating:", error);
      }
    };

    fetchStarRating();
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

        <Link to="/create-token" className="settings-item">
          <FaPlusCircle />
          <div className="settings-item-text">
            <span className="settings-item-title">Create Token</span>
            <span className="settings-item-description">
              {getDescription("Create your own synthetic asset", "Create token")}
            </span>
          </div>
        </Link>

        <Link to="/merchant" className="settings-item">
          <FaStore />
          <div className="settings-item-text">
            <span className="settings-item-title">Become a Merchant</span>
            <span className="settings-item-description">
              {getDescription("Apply to receive direct deposits", "Become merchant")}
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

        <Link to="/notifications" className="settings-item">
          <FaBell />
          <div className="settings-item-text">
            <span className="settings-item-title">Notifications</span>
            <span className="settings-item-description">
              {getDescription("View your messages and alerts", "Notifications")}
            </span>
          </div>
        </Link>

        <Link to="/about" className="settings-item">
          <FaBook />
          <div className="settings-item-text">
            <span className="settings-item-title">About</span>
            <span className="settings-item-description">
              {getDescription("Learn more about this app", "About app")}
            </span>
          </div>
        </Link>

        <Link to="/FAQ" className="settings-item">
          <FaRegLightbulb />
          <div className="settings-item-text">
            <span className="settings-item-title">FAQs</span>
            <span className="settings-item-description">
              {getDescription("Frequently Asked Questions", "FAQs")}
            </span>
          </div>
        </Link>

        <a href="mailto:support@swapviewapp.site" className="settings-item">
          <FaEnvelope />
          <div className="settings-item-text">
            <span className="settings-item-title">Contact Us</span>
            <span className="settings-item-description">
              {getDescription("Reach out to our support team", "Email support")}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Settings;
