import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL || window.API_BASE || "http://localhost:5002";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMessage("Missing token. Please use the link from your email.");
        setTimeout(() => (window.location.href = "/login"), 3000);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE}/api/users/verify-email`, {
          params: { token },       // يضيف ?token=...
          // withCredentials: true, // فعّلها فقط إذا سيرفرك يعتمد كوكيز
        });

        if (cancelled) return;
        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
        setTimeout(() => (window.location.href = "/login"), 3000);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.";
        setStatus("error");
        setMessage(msg);
        setTimeout(() => (window.location.href = "/login"), 3000);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Email Verification</h2>
        <div
          style={{
            ...styles.alert,
            backgroundColor: status === "success" ? "#d4edda" : "#f8d7da",
            color: status === "success" ? "#155724" : "#721c24",
            borderColor: status === "success" ? "#c3e6cb" : "#f5c6cb",
          }}
        >
          {message}
        </div>
        <p style={{ marginTop: "1rem", fontSize: 14, color: "#666" }}>
          You will be redirected shortly...
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0B0D19",
    padding: 16,
  },
  card: {
    background: "white",
    padding: "2rem",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "90%",
    maxWidth: 420,
  },
  alert: {
    padding: "1rem",
    borderRadius: 8,
    border: "1px solid",
  },
};
