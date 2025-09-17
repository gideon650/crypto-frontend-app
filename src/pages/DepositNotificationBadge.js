import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBadge.css'; // Reuse the same CSS styles

const DepositNotificationBadge = () => {
  const [depositCount, setDepositCount] = useState(0);

  const fetchDepositNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/notifications/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Filter for unread merchant deposit confirmations
      const depositConfirmations = response.data.filter(notification => {
        const hasDepositId = notification.deposit_id || (notification.deposit && notification.deposit.id);
        const isDepositConfirmation = !notification.message.includes('Confirm once you receive payment');
        
        return !notification.is_read && 
               notification.action_buttons && 
               hasDepositId && 
               isDepositConfirmation;
      });

      setDepositCount(depositConfirmations.length);
    } catch (error) {
      console.error("Error fetching deposit notifications:", error);
      setDepositCount(0);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchDepositNotifications();

    // Set up polling to check for new deposit notifications every 30 seconds
    const pollInterval = setInterval(fetchDepositNotifications, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  if (!depositCount) return null;

  return (
    <div className="notification-badge">
      {depositCount}
    </div>
  );
};

export default DepositNotificationBadge;