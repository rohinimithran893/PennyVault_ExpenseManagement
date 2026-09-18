import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { saveAuth } from "../utils/auth";
import "../Styles/Login.css";
import loginIllustration from "../assets/login-illustration.png";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconShieldLock,
  IconUsers,
  IconWallet,
  IconChartPie,
  IconShoppingCart,
  IconBolt,
  IconGasStation,
  IconWifi,
} from "@tabler/icons-react";

const Login = () => {
  const navigate = useNavigate();

  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateLogin = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError("");

    const isValid = validateLogin();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(
        email.trim(),
        password
      );
      saveAuth(data);
      navigate("/");
    } catch (err) {
      setError(
        err?.message ||
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login_brand-logo">P</div>
          <div>
            <h2>PennyVault</h2>
            <span>Expense Manager</span>
          </div>
        </div>

        <div className="login_hero-text">
          <h1>
            Manage your household finances <span>together.</span>
          </h1>

          <p>
            Share budgets, track expenses, invite family members and stay
            financially aligned.
          </p>
        </div>

<div className="hero-illustration">
    <img src={loginIllustration} alt="PennyVault Illustration" />
  </div>      

        {/* Features */}
        <div className="why-section">
          <h5>WHY PENNYVAULT?</h5>

          <div className="feature-row">
            <div className="feature">
              <IconUsers size={22} />
              <div>
                <strong>Shared Budgets</strong>
                <p>Create and manage budgets together.</p>
              </div>
            </div>

            <div className="feature">
              <IconShieldLock size={22} />
              <div>
                <strong>Real-time Collaboration</strong>
                <p>Stay updated with family spending.</p>
              </div>
            </div>

            <div className="feature">
              <IconChartPie size={22} />
              <div>
                <strong>Smart Insights</strong>
                <p>Understand spending trends instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <div className="welcome-pill">WELCOME BACK</div>

          <h2>Sign in to PennyVault.</h2>

          <p>
            Access your household finances and stay financially aligned.
          </p>

          <div className="input-field">
            <IconMail size={20} />
            <input 
            type="email" 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }} />
          </div>

          <div className="input-field">
            <IconLock size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <button
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <IconEyeOff size={18} />
              ) : (
                <IconEye size={18} />
              )}
            </button>
          </div>

          <div className="login-options">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              Remember Me
            </label>

            <button className="text-btn">Forgot Password?</button>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button className="signin-btn"
          onClick={handleLogin}
          disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <IconArrowRight size={18} />}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="demo-section">
            <h4>Try Demo Accounts</h4>

            <div className="demo-buttons">
              <button>Primary Owner</button>
              <button>Co-owner</button>
              <button>Member</button>
            </div>
          </div>

          <div className="secure-note">
            <IconShieldLock size={18} />
            Secure • Encrypted • Family-first
          </div>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup">Create Account</Link>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;