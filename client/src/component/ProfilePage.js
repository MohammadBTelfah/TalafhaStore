import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/ProfilePage.css";

// يحوّل أي مسار نسبي للصورة لمسار مطلق + يصلّح backslashes
function toAbsoluteUrl(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  s = s.replace(/\\/g, "/").replace(/^\.{1,2}\//, "");
  const idx = s.indexOf("uploads/");
  if (idx >= 0) s = s.slice(idx);
  else if (!s.includes("/") || /\.[a-z0-9]+$/i.test(s)) s = `uploads/${s}`;
  s = s.replace(/^\/+/, "");
  return `http://127.0.0.1:5002/${s}`;
}

// عنصر حقل مع زر قلم (قفل/فتح التعديل)
function Field({
  label, name, type = "text",
  value, onChange,
  editable, toggleEditable,
  placeholder, autoComplete,
  disabled
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-wrap">
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={!editable || disabled}
          disabled={disabled}
          className={!editable || disabled ? "locked" : ""}
        />
        {!disabled && (
          <button
            type="button"
            className={`icon-pencil ${editable ? "active" : ""}`}
            onClick={toggleEditable}
            title={editable ? "Lock" : "Edit"}
            aria-label="Toggle edit"
          >
            ✎
          </button>
        )}
      </div>
    </label>
  );
}


export default function ProfilePage({ darkMode = false }) {
    
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [profile, setProfile] = useState({
    profileImage: "",
    username: "",
    email: "",
    fullName: "",
    phone: "",
    verified: false,
  });

  const [canEdit, setCanEdit] = useState({
    username: false, email: false, fullName: false, phone: false
  });

  // الصورة
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setPreview]  = useState("");
  const fileRef = useRef(null);

  // مودال كلمة المرور
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });
  const [pwVisible, setPwVisible] = useState({
    current: false, next: false, confirm: false
  });

  // تحميل البروفايل
  useEffect(() => {
    setLoading(true);
    setError("");
    axios.get("http://127.0.0.1:5002/api/users/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
    })
    .then((res) => {
      const data = res.data?.user || res.data || {};
      setProfile({
        profileImage: data.profileImage || "",
        username: data.username || "",
        email: data.email || "",
        fullName: data.fullName || "",
        phone: data.phone || "",
        verified: !!data.verified,
      });
      setPreview(toAbsoluteUrl(data.profileImage || ""));
    })
    .catch((err) => {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load profile.");
    })
    .finally(() => setLoading(false));
  }, []);

  // تغيـير الصورة
  const onAvatarClick = () => fileRef.current?.click();
  const onFileChange  = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // حقول النصوص
  const onFieldChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  // حفظ التعديلات
  const saveAll = async () => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const form = new FormData();
      form.append("username", profile.username);
      form.append("email", profile.email);
      form.append("fullName", profile.fullName);
      form.append("phone", profile.phone);
      if (imageFile) form.append("profileImage", imageFile);

      const res = await axios.put(
        "http://127.0.0.1:5002/api/users/update-profile",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      const updated = res.data?.user || res.data || {};
      setProfile((p) => ({
        ...p,
        profileImage: updated.profileImage ?? p.profileImage,
        username: updated.username ?? p.username,
        email: updated.email ?? p.email,
        fullName: updated.fullName ?? p.fullName,
        phone: updated.phone ?? p.phone,
        verified: updated.verified ?? p.verified,
      }));
      if (updated.profileImage) setPreview(toAbsoluteUrl(updated.profileImage));
      setImageFile(null);
      setCanEdit({ username: false, email: false, fullName: false, phone: false });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // تغيير كلمة المرور
  const submitPw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) return setError("New password must be at least 8 characters.");
    if (pwForm.newPassword !== pwForm.confirmPassword) return setError("New password and confirmation do not match.");

    setPwSaving(true); setError(""); setSuccess("");
    try {
      await axios.post(
        "http://127.0.0.1:5002/api/users/change-password",
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      setSuccess("Password changed successfully.");
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  // كلاس الصفحة: au-page + au-dark لو darkMode=true
  const pageClass = `au-page${darkMode ? " au-dark" : ""}`;

  return (
    <div className={pageClass}>
      <div className="au-container">
        <header className="au-header">
          <h1>Profile</h1>
          <div className="au-actions">
            <button type="button" className="btn ghost" onClick={() => setPwOpen(true)}>
              Change Password
            </button>
            <button type="button" className="btn primary" onClick={saveAll} disabled={saving || loading}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="au-grid">
            {/* يسار: الصورة + التحقق */}
            <section className="card left">
              <div className="chips">
                <span className="chip">
                  <span className="dot" />
                  {profile.verified ? "Verified" : "Not Verified"}
                </span>
              </div>

              <div className="avatar-wrap">
                <div className="avatar" onClick={onAvatarClick} title="Change photo">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      onError={(e) => { e.currentTarget.src = ""; }}
                    />
                  ) : (
                    <div className="avatar-placeholder">+</div>
                  )}
                  <div className="avatar-badge">Edit</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={onFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </section>

            {/* يمين: الحقول */}
            <section className="card right">
              <div className="fields">
                <Field
                  label="Username" name="username"
                  value={profile.username} onChange={onFieldChange}
                  editable={canEdit.username}
                  toggleEditable={() => setCanEdit(s => ({ ...s, username: !s.username }))}
                  placeholder="username" autoComplete="username"
                />
                <Field
                  label="Email" name="email" type="email"
                  value={profile.email} onChange={onFieldChange}
                  editable={canEdit.email}
                  toggleEditable={() => setCanEdit(s => ({ ...s, email: !s.email }))}
                  placeholder="email@example.com" autoComplete="email"
                />
                <Field
                  label="Full Name" name="fullName"
                  value={profile.fullName} onChange={onFieldChange}
                  editable={canEdit.fullName}
                  toggleEditable={() => setCanEdit(s => ({ ...s, fullName: !s.fullName }))}
                  placeholder="Your full name" autoComplete="name"
                />
                <Field
                  label="Phone" name="phone"
                  value={profile.phone} onChange={onFieldChange}
                  editable={canEdit.phone}
                  toggleEditable={() => setCanEdit(s => ({ ...s, phone: !s.phone }))}
                  placeholder="+962 7x xxx xxxx" autoComplete="tel"
                />
                <Field
                  label="Verified" name="verified"
                  value={profile.verified ? "Yes" : "No"}
                  onChange={() => {}} editable={false} toggleEditable={() => {}}
                  disabled
                />
              </div>
            </section>
          </div>
        )}
      </div>

      {/* MODAL: Password */}
      {pwOpen && (
        <div className="modal-backdrop" onClick={() => setPwOpen(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="icon-btn" onClick={() => setPwOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={submitPw} className="modal-body">
              <label className="field">
                <span>Current Password</span>
                <div className="pw">
                  <input
                    type={pwVisible.current ? "text" : "password"}
                    name="currentPassword"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <button type="button" className="eye"
                          onClick={() => setPwVisible(v => ({ ...v, current: !v.current }))}>
                    {pwVisible.current ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>

              <label className="field">
                <span>New Password</span>
                <div className="pw">
                  <input
                    type={pwVisible.next ? "text" : "password"}
                    name="newPassword"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                  <button type="button" className="eye"
                          onClick={() => setPwVisible(v => ({ ...v, next: !v.next }))}>
                    {pwVisible.next ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>

              <label className="field">
                <span>Confirm New Password</span>
                <div className="pw">
                  <input
                    type={pwVisible.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                  />
                  <button type="button" className="eye"
                          onClick={() => setPwVisible(v => ({ ...v, confirm: !v.confirm }))}>
                    {pwVisible.confirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>

              <div className="btns-row">
                <button type="button" className="btn ghost" onClick={() => setPwOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={pwSaving}>
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
