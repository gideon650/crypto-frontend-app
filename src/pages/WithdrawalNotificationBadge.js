import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBadge.css'; // Reuse the same CSS styles

const WithdrawalNotificationBadge = () => {
  const [withdrawalCount, setWithdrawalCount] = useState(0);

  const fetchWithdrawalNotifications = async () => {
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

      // Filter for unread withdrawal confirmations
      const withdrawalConfirmations = response.data.filter(notification => {
        const hasWithdrawalId = notification.withdrawal_id || (notification.withdrawal && notification.withdrawal.id);
        const isWithdrawalConfirmation = notification.message.includes('Confirm once you receive payment');
        
        return !notification.is_read && 
               notification.action_buttons && 
               hasWithdrawalId && 
               isWithdrawalConfirmation;
      });

      setWithdrawalCount(withdrawalConfirmations.length);
    } catch (error) {
      console.error("Error fetching withdrawal notifications:", error);
      setWithdrawalCount(0);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchWithdrawalNotifications();

    // Set up polling to check for new withdrawal notifications every 30 seconds
    const pollInterval = setInterval(fetchWithdrawalNotifications, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  if (!withdrawalCount) return null;

  return (
    <div className="notification-badge">
      {withdrawalCount}
    </div>
  );
};

export default WithdrawalNotificationBadge;