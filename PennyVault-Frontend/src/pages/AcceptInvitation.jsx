import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { acceptHouseholdInvitation } from "../services/householdAccessService";
import { isAuthenticated, logout } from "../utils/auth";

const AcceptInvitation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");
  const acceptanceRequest = useRef(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your household invitation...");

  useEffect(() => {
    if (!isAuthenticated()) return;
    if (!token) {
      setStatus("error");
      setMessage("This invitation link is missing its token. Please ask the household owner to send a new invitation.");
      return;
    }
    if (!acceptanceRequest.current) {
      acceptanceRequest.current = acceptHouseholdInvitation(token);
    }

    let active = true;
    acceptanceRequest.current
      .then(() => {
        if (!active) return;
        setStatus("success");
        setMessage("Your invitation has been accepted. Welcome to the household!");
        window.setTimeout(() => navigate("/", { replace: true }), 1800);
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(error?.message || "We couldn't accept this invitation. Please try again or contact the household owner.");
      });

    return () => {
      active = false;
    };
  }, [navigate, token]);

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    );
  }

  const signInWithInvitedEmail = () => {
    logout();
    navigate("/login", {
      replace: true,
      state: { from: { pathname: location.pathname, search: location.search } },
    });
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={status === "success" ? styles.successIcon : styles.icon}>
          {status === "loading" ? "…" : status === "success" ? "✓" : "!"}
        </div>
        <h1 style={styles.title}>
          {status === "loading" ? "Accepting invitation" : status === "success" ? "Invitation accepted" : "Invitation could not be accepted"}
        </h1>
        <p style={styles.message} role="status" aria-live="polite">{message}</p>
        {status === "error" && (
          <div style={styles.actions}>
            <button type="button" style={styles.primaryButton} onClick={() => window.location.reload()}>
              Try again
            </button>
            <button type="button" style={styles.secondaryButton} onClick={signInWithInvitedEmail}>
              Sign in with invited email
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#f7f6fa", fontFamily: "Arial, sans-serif" },
  card: { width: "100%", maxWidth: 460, padding: 36, borderRadius: 16, background: "#fff", textAlign: "center", boxShadow: "0 12px 40px rgba(30, 25, 62, .10)" },
  icon: { width: 52, height: 52, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#eeeaff", color: "#6542e8", fontSize: 28, fontWeight: 700 },
  successIcon: { width: 52, height: 52, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#eaf9f0", color: "#15934c", fontSize: 28, fontWeight: 700 },
  title: { margin: "0 0 10px", color: "#17162d", fontSize: 22 },
  message: { margin: 0, color: "#77748d", fontSize: 14, lineHeight: 1.6 },
  actions: { display: "flex", flexDirection: "column", gap: 10, marginTop: 24 },
  primaryButton: { border: 0, borderRadius: 8, padding: "12px 16px", background: "#6040df", color: "#fff", fontWeight: 600, cursor: "pointer" },
  secondaryButton: { border: "1px solid #dedbe9", borderRadius: 8, padding: "12px 16px", background: "#fff", color: "#4e4b66", fontWeight: 600, cursor: "pointer" },
};

export default AcceptInvitation;
