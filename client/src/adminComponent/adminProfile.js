// adminProfile.js
import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ قاعدة الـ API من env (CRA) — محلياً غيّرها إلى http://127.0.0.1:5002 في client/.env
const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5002";

export default function AdminProfile() {
  const [localProfile, setLocalProfile] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ msg: "", type: "" });

  const showNotification = (msg, type = "info") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif({ msg: "", type: "" }), 2500);
  };

  const token = localStorage.getItem("token");

  // === Load my profile (إن احتجت تجيب البيانات من السيرفر) ===
  useEffect(() => {
    // إذا كان عندك endpoint لجلب البروفايل (اختياري):
    // axios.get(`${API_BASE}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` }})
    //   .then(res => setLocalProfile(res.data.user))
    //   .catch(() => {});
    //
    // أو لو بتخزّنها عند تسجيل الدخول:
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        setLocalProfile(JSON.parse(cached));
      }
    } catch (e) {}
  }, []);

  // ==== Helpers ====
  const avatarSrc =
    localProfile?.profileImage
      ? // لو صورة غوغل (رابط كامل)
        localProfile.profileImage.includes("googleusercontent")
        ? localProfile.profileImage
        : `${API_BASE}/uploads/${localProfile.profileImage}`
      : "https://i.pravatar.cc/150?u=default";

  const handleFieldChange = (key, value) => {
    setLocalProfile((prev) => ({ ...prev, [key]: value }));
    setEditMode((prev) => ({ ...prev, [key]: true }));
  };

  // === Update profile fields ===
  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      // جمع كل الحقول المعدّلة (أو أرسل الكل ببساطة)
      Object.entries(localProfile || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });

      const res = await axios.put(
        `${API_BASE}/api/users/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLocalProfile(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setEditMode({});
      showNotification("Profile updated successfully", "success");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // === Upload/Change profile image ===
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_BASE}/api/users/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLocalProfile(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showNotification("Profile picture updated successfully", "success");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Image upload failed",
        "error"
      );
    } finally {
      setLoading(false);
      // تنظيف قيمة input حتى تقدّر ترفع نفس الملف مرة ثانية إن رغبت
      e.target.value = "";
    }
  };

  // === Change password ===
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showNotification("Passwords do not match", "error");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/api/users/change-password`,
        {
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPassword(false);
      showNotification("Password changed successfully", "success");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Password update failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!localProfile) {
    return <div style={{ padding: 16 }}>Loading profile…</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: 16 }}>
      {/* Notification */}
      {notif.msg && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background:
              notif.type === "success"
                ? "#e6ffed"
                : notif.type === "error"
                ? "#ffeded"
                : "#eef2ff",
            color:
              notif.type === "success"
                ? "#0a6b2b"
                : notif.type === "error"
                ? "#7a0000"
                : "#20234a",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {notif.msg}
        </div>
      )}

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src={avatarSrc}
          alt="Avatar"
          style={{
            width: 100,
            height: 100,
            objectFit: "cover",
            borderRadius: "50%",
            border: "1px solid #ddd",
          }}
        />
        <label
          style={{
            border: "1px solid #ccc",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            background: "#fafafa",
          }}
        >
          Change Picture
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Editable fields */}
      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        <Field
          label="Full Name"
          value={localProfile.fullName || ""}
          onChange={(v) => handleFieldChange("fullName", v)}
        />
        <Field
          label="Username"
          value={localProfile.username || ""}
          onChange={(v) => handleFieldChange("username", v)}
        />
        <Field
          label="Email"
          value={localProfile.email || ""}
          onChange={(v) => handleFieldChange("email", v)}
        />
        <Field
          label="Phone"
          value={localProfile.phone || ""}
          onChange={(v) => handleFieldChange("phone", v)}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: "#1976d2",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Change password */}
      <div style={{ marginTop: 32 }}>
        <h3>Change Password</h3>
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Current password"
            value={passwordData.current}
            onChange={(e) =>
              setPasswordData((p) => ({ ...p, current: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={passwordData.new}
            onChange={(e) =>
              setPasswordData((p) => ({ ...p, new: e.target.value }))
            }
            style={inputStyle}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={passwordData.confirm}
            onChange={(e) =>
              setPasswordData((p) => ({ ...p, confirm: e.target.value }))
            }
            style={inputStyle}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((s) => !s)}
            />
            Show passwords
          </label>

          <button
            onClick={handlePasswordChange}
            disabled={loading}
            style={{
              background: "#2e7d32",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Simple input field component ===
function Field({ label, value, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#555" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
};
