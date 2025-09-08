import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (onLogout) => {
  const navigate = useNavigate();
  const leftAppTimeRef = useRef(null); // When user left the app
  const timeoutRef = useRef(null);
  
  // Auto logout timeout when away from app (1 minute = 60000ms)
  const AWAY_TIMEOUT = 60000;
  
  // Don't track activity if no logout callback is provided
  const shouldTrack = !!onLogout;

  const clearUserSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('leftAppTime');
    localStorage.removeItem('user');
    // Clear any other user-related data from localStorage
  }, []);

  const forceLogout = useCallback((reason = 'Session expired') => {
    clearUserSession();
    if (onLogout) {
      onLogout();
    }
    alert(`${reason}. Please log in again.`);
    navigate('/?expired=true', { replace: true });
  }, [clearUserSession, onLogout, navigate]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // User left the app - record the time
      const leftTime = Date.now();
      leftAppTimeRef.current = leftTime;
      localStorage.setItem('leftAppTime', leftTime.toString());
      
      // Set timeout for when they should be logged out if they don't return
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // Only logout if they're still away
        if (document.hidden) {
          forceLogout('Session expired while away from app');
        }
      }, AWAY_TIMEOUT);
      
    } else {
      // User returned to the app
      const returnTime = Date.now();
      
      // Check if they were away longer than allowed
      const storedLeftTime = localStorage.getItem('leftAppTime');
      const leftTime = storedLeftTime ? parseInt(storedLeftTime) : leftAppTimeRef.current;
      
      if (leftTime) {
        const awayDuration = returnTime - leftTime;
        
        if (awayDuration > AWAY_TIMEOUT) {
          forceLogout('Session expired - you were away too long');
          return;
        }
      }
      
      // Clear the timeout since they're back
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear the left time since they're back
      leftAppTimeRef.current = null;
      localStorage.removeItem('leftAppTime');
    }
  }, [AWAY_TIMEOUT, forceLogout]);

  useEffect(() => {
    // Don't track if no logout callback or user not authenticated
    if (!shouldTrack) {
      return;
    }

    // Check if user has a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      return; // No need to track if user is not logged in
    }

    // Check if user was away when they closed the app previously
    const storedLeftTime = localStorage.getItem('leftAppTime');
    if (storedLeftTime) {
      const leftTime = parseInt(storedLeftTime);
      const now = Date.now();
      const awayDuration = now - leftTime;
      
      if (awayDuration > AWAY_TIMEOUT) {
        forceLogout('Session expired - you were away too long');
        return;
      }
      
      // They're back within the time limit, clear the stored time
      localStorage.removeItem('leftAppTime');
    }

    // Listen for visibility changes (user switching tabs/apps or closing browser)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldTrack, AWAY_TIMEOUT, handleVisibilityChange, forceLogout]);

  // Manual logout method
  const manualLogout = useCallback(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Clear left app time
    leftAppTimeRef.current = null;
    localStorage.removeItem('leftAppTime');
    
    // Perform logout
    forceLogout('Manual logout');
  }, [forceLogout]);

  // Return methods that parent components can use
  return {
    forceLogout: manualLogout,
    clearSession: clearUserSession
  };
};

export default useAutoLogout;