// Auth.js (fixed)
import React, { useState, useEffect } from "react";
import { FaTelegram } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import "./Auth.css";

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
  const [formData, setFormData] = useState(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false); // Track if registration is done
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user was redirected here due to session expiry
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const expired = urlParams.get('expired');
    if (expired === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.');
    }
  }, [location]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    // Clear all form fields when toggling
    setIdentifier("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setReferralCode("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Add password confirmation check for signup
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      // LOGIN FLOW
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
          // Store token in localStorage and call onLogin
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
      // SIGNUP FLOW - First register the user
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
          // Registration successful, now show terms modal
          setRegistrationCompleted(true);
          setIsNewUser(true);
          setShowTerms(true);
        } else {
          // Handle registration errors
          if (registerData.error) {
            setError(registerData.error);
          } else if (typeof registerData === "object") {
            // Handle validation errors from serializer
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
    // After accepting terms, auto-login the user
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
                disabled={isLoading}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Referral Code (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isLoading}
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
              disabled={isLoading}
            />
          )}
          
          {/* Password field with visibility toggle */}
          <div className="password-input-container">
            <input
              type={isLogin ? (showLoginPassword ? "text" : "password") : (showPassword ? "text" : "password")}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <span 
              className="password-toggle"
              onClick={() => isLogin ? setShowLoginPassword(!showLoginPassword) : setShowPassword(!showPassword)}
            >
              {isLogin 
                ? (showLoginPassword ? "🙈" : "👁️") 
                : (showPassword ? "🙈" : "👁️")
              }
            </span>
          </div>
          
          {/* Confirm Password field (only for signup) */}
          {!isLogin && (
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <span 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
          )}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>
        
        <p onClick={toggleForm} style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
        
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
      
      {/* Terms Modal */}
      <TermsModal 
        show={showTerms} 
        onAccept={handleAcceptTerms}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Auth;