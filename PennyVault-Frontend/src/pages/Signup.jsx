import React, { useState } from "react";
import { register } from "../services/authService";
import { Link, useNavigate} from "react-router-dom";
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconShieldLock
} from "@tabler/icons-react";

import "../Styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
      const newErrors = {};
        if (!fullName.trim()) {
          newErrors.fullName = "Full name is required";
        }

        if (!email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
          newErrors.password = "Password is required";
        } else if (password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }

        if (!confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    setServerError("");

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      
      await register(
        fullName.trim(),
        email.trim(),
        password
      );
      navigate("/login");
    } catch (error) {
      if (error?.errors) {
        setErrors(error.errors);
      } else if (error?.message) {
        setServerError(error.message);
      } else {
        setServerError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* LEFT PANEL */}
      <div className="signup-left">
        <div className="brand">
          <div className="brand-logo">P</div>
          <div>
            <h2>PennyVault</h2>
            <p>Expense Manager</p>
          </div>
        </div>

        <div className="hero-text">
          <h1>
            Manage your household <span>finances together</span>
          </h1>

          <p>
            Track expenses, set budgets, and achieve your financial
            goals as a family.
          </p>
        </div>

        <div className="wallet-illustration">
          <div className="wallet"></div>

          <div className="coin coin1">₹</div>
          <div className="coin coin2">₹</div>
          <div className="coin coin3">₹</div>

          <div className="floating-card chart"></div>
          <div className="floating-card donut"></div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="signup-right">
        <div className="signup-card">
          <span className="welcome-badge">WELCOME</span>

          <h2>Create your account</h2>
          <p>Get started with PennyVault</p>

          <div className="form-group">
            <label>Full Name</label>

            <div className="input-box">
              <IconUser size={20} />
              <input type="text" placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}/>
            </div>
            {errors.fullName && (
              <small className="field-error">{errors.fullName}</small>
          )}
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <div className="input-box">
              <IconMail size={20} />
              <input type="email" placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}/>
            </div>
            {errors.email && (
              <small className="field-error">{errors.email}</small>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="input-box">
              <IconLock size={20} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IconEyeOff size={20} />
                ) : (
                  <IconEye size={20} />
                )}
              </button>
            </div>

            <small>
              At least 8 characters with uppercase, lowercase,
              number & symbol.
            </small>
            {errors.password && (
              <small className="field-error">{errors.password}</small>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <div className="input-box">
              <IconLock size={20} />

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm   ? (
                  <IconEyeOff size={20} />
                ) : (
                  <IconEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <small className="field-error">
                {errors.confirmPassword}
              </small>
        )}
          </div>

          {/* OWNER INFO */}
          <div className="owner-info">
            <IconInfoCircle size={22} />

            <div>
              <h4>You'll be the Primary Owner</h4>

              <p>
                As the first user, you'll become the Primary Owner.
                Invite family members later from People & Access.
              </p>
            </div>
          </div>

            {serverError && (
              <div className="server-error">
                {serverError}
              </div>
            )}

          <button type="button"
           className="signup-btn"
           onClick={handleSignup}
           disabled={loading}
           >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="google-btn">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
            />
            Sign up with Google
          </button>

          <div className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>

          <div className="secure-note">
            <IconShieldLock size={18} />
            Secure • Encrypted • Family-first
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;