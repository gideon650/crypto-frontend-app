import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(""); // Username or Email for login
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false); // For login password visibility
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
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
      // LOGIN FLOW (unchanged)
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: identifier, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          alert("Login successful!");
          navigate("/dashboard");
        } else {
          setError(data.error || "Login failed. Please check your credentials.");
        }
      } catch (err) {
        console.error("Error during login:", err);
        setError("Something went wrong. Please try again.");
      }
    } else {
      // SIGNUP FLOW (unchanged)
      try {
        const registerResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            referral_code: referralCode || "",
          }),
        });

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          alert("Signup successful! Logging you in...");

          const loginResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            localStorage.setItem("token", loginData.token);
            alert("Logged in successfully!");
            navigate("/dashboard");
          } else {
            setError(loginData.error || "Auto-login failed after registration.");
          }
        } else {
          setError(
            registerData.message ||
              (typeof registerData === "object"
                ? Object.values(registerData).flat().join(" ")
                : "Signup failed. Please check your details.")
          );
        }
      } catch (err) {
        console.error("Error during signup:", err);
        setError("Something went wrong. Please try again.");
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
      </div>
    </div>
  );
};

export default Auth;
