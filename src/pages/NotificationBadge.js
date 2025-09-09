import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBadge.css';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/notifications/unread-count/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchUnreadCount();

    // Set up polling to check for new notifications every 30 seconds
    const pollInterval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  if (!unreadCount) return null;

  return (
    <div className="notification-badge">
      {unreadCount}
    </div>
  );
};

export default NotificationBadge;