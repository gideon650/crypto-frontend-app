import React, { useState } from "react";
import { FaTelegram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(""); // Username or Email for login
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();

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

    // Add password confirmation check for signup
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
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
          // Store token in localStorage
          if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Login successful!");
            navigate("/dashboard");
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
      // SIGNUP FLOW - Updated to handle backend response properly
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
          alert("Registration successful! Please log in with your credentials.");
          
          // Since backend doesn't return token on registration, 
          // automatically attempt login after successful registration
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

            if (loginResponse.ok && loginData.token) {
              localStorage.setItem("token", loginData.token);
              alert("Logged in successfully!");
              navigate("/dashboard");
            } else {
              // Registration succeeded but auto-login failed
              alert("Registration successful! Please log in manually.");
              setIsLogin(true); // Switch to login form
              setIdentifier(username); // Pre-fill username
              setPassword(""); // Clear password for security
            }
          } catch (loginErr) {
            console.error("Error during auto-login:", loginErr);
            alert("Registration successful! Please log in manually.");
            setIsLogin(true);
            setIdentifier(username);
            setPassword("");
          }
        } else {
          // Handle registration errors
          if (registerData.error) {
            setError(registerData.error);
          } else if (typeof registerData === "object") {
            // Handle validation errors from serializer
            const errors = [];
            // eslint-disable-next-line no-unused-vars
            for (const [field, messages] of Object.entries(registerData)) {
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
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
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
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Referral Code (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
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
            />
            <span 
              className="password-toggle"
              onClick={() => isLogin ? setShowLoginPassword(!showLoginPassword) : setShowPassword(!showPassword)}
            >
              {isLogin 
                ? (showLoginPassword ? "👁️" : "👁️‍🗨️") 
                : (showPassword ? "👁️" : "👁️‍🗨️")
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
              />
              <span 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
          )}
          
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>
        <p onClick={toggleForm} style={{ cursor: "pointer", marginTop: "10px" }}>
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
    </div>
  );
};

export default Auth;
