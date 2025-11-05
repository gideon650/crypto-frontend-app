// Auth.js (with disable flag - easy to re-enable later)
import React, { useState, useEffect } from "react";
import { FaTelegram } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import "./Auth.css";

// FEATURE FLAG: Set to false to re-enable login
const LOGIN_DISABLED = true;

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const expired = urlParams.get('expired');
    if (expired === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.');
    }
  }, [location]);

  const toggleForm = () => {
    if (LOGIN_DISABLED) return; // Prevent toggling when disabled
    
    setIsLogin(!isLogin);
    setError("");
    setIdentifier("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setReferralCode("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Block submission if login is disabled
    if (LOGIN_DISABLED) {
      setError("Login is temporarily disabled. Please check our Telegram channel for updates.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            username: identifier, 
            password 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.token && onLogin) {
            await onLogin(data);
            navigate("/dashboard", { replace: true });
          } else {
            setError("Login successful but no token received. Please try again.");
          }
        } else {
          setError(data.error || data.message || "Login failed. Please check your credentials.");
        }
      } catch (err) {
        console.error("Error during login:", err);
        setError("Network error. Please check your connection and try again.");
      }
    } else {
      try {
        const registerResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/register/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            email,
            password,
            referral_code: referralCode || "",
          }),
        });

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          setRegistrationCompleted(true);
          setIsNewUser(true);
          setShowTerms(true);
        } else {
          if (registerData.error) {
            setError(registerData.error);
          } else if (typeof registerData === "object") {
            const errors = [];
            for (const [, messages] of Object.entries(registerData)) {
              if (Array.isArray(messages)) {
                errors.push(...messages);
              } else {
                errors.push(messages);
              }
            }
            setError(errors.join(" "));
          } else {
            setError("Registration failed. Please check your details and try again.");
          }
        }
      } catch (err) {
        console.error("Error during signup:", err);
        setError("Network error. Please check your connection and try again.");
      }
    }
    
    setIsLoading(false);
  };

  const handleAcceptTerms = async () => {
    if (isNewUser && registrationCompleted) {
      setIsLoading(true);
      
      try {
        const loginResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            username, 
            password 
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.token && onLogin) {
          await onLogin(loginData);
          navigate("/dashboard", { replace: true });
        } else {
          setError("Registration successful! Please log in manually.");
          setIsLogin(true);
          setIdentifier(username);
          setPassword("");
        }
      } catch (loginErr) {
        console.error("Error during auto-login:", loginErr);
        setError("Registration successful! Please log in manually.");
        setIsLogin(true);
        setIdentifier(username);
        setPassword("");
      }
      
      setIsLoading(false);
    }
    
    setShowTerms(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "LOGIN" : "SIGN UP"}</h2>
        
        {/* Maintenance Message - Top */}
        {LOGIN_DISABLED && (
          <div className="maintenance-message">
            <p><a href="https://swapviewapplications.com">swapviewapplications.com</a></p>
            <p>Having issues logging in? Check out the announcement on our Telegram channel.</p>
          </div>
        )}
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Enter first and last name"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || LOGIN_DISABLED}
                style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || LOGIN_DISABLED}
                style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              />
              <input
                type="text"
                placeholder="Referral Code (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isLoading || LOGIN_DISABLED}
                style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              />
            </>
          )}
          {isLogin && (
            <input
              type="text"
              placeholder="First and last name or Email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading || LOGIN_DISABLED}
              style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            />
          )}
          
          <div className="password-input-container">
            <input
              type={isLogin ? (showLoginPassword ? "text" : "password") : (showPassword ? "text" : "password")}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || LOGIN_DISABLED}
              style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            />
            <span 
              className="password-toggle"
              onClick={() => !LOGIN_DISABLED && (isLogin ? setShowLoginPassword(!showLoginPassword) : setShowPassword(!showPassword))}
              style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {isLogin 
                ? (showLoginPassword ? "🙈" : "👁️") 
                : (showPassword ? "🙈" : "👁️")
              }
            </span>
          </div>
          
          {!isLogin && (
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || LOGIN_DISABLED}
                style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              />
              <span 
                className="password-toggle"
                onClick={() => !LOGIN_DISABLED && setShowConfirmPassword(!showConfirmPassword)}
                style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || LOGIN_DISABLED}
            style={LOGIN_DISABLED ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {LOGIN_DISABLED 
              ? "Login Temporarily Disabled" 
              : (isLoading ? "Processing..." : (isLogin ? "Login" : "Sign Up"))
            }
          </button>
        </form>
        
        <p 
          onClick={toggleForm} 
          style={{ 
            cursor: (isLoading || LOGIN_DISABLED) ? 'not-allowed' : 'pointer',
            opacity: LOGIN_DISABLED ? 0.5 : 1
          }}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
        
        {/* Maintenance Message - Bottom */}
        {LOGIN_DISABLED && (
          <div className="maintenance-message" style={{ marginTop: '16px' }}>
            <p>Having issues logging in? Check out the announcement on our Telegram channel.</p>
          </div>
        )}
        
        <a 
          href="https://t.me/Swapview" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="telegram-link"
        >
          <FaTelegram className="telegram-icon" />
          Join us on Telegram
        </a>
      </div>
      
      <TermsModal 
        show={showTerms} 
        onAccept={handleAcceptTerms}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Auth;
