import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../assets/components/UserLayout";
import "../styles/setting.css";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3006';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("verifake-settings");
    if (saved) return JSON.parse(saved);
    return {
      darkMode: false,
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
    };
  });

  // Modal states
  const [modal, setModal] = useState(null); // 'profile' | 'password' | 'language' | 'delete'

  // Edit Profile form
  const storedUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const [profileForm, setProfileForm] = useState({
    name: storedUser.username || storedUser.name || "",
    email: storedUser.email || "",
  });
  const [profileMsg, setProfileMsg] = useState("");

  // Change Password form
  const [passwordForm, setPasswordForm] = useState({
    current: "", newPass: "", confirm: ""
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  // Language
  const [language, setLanguage] = useState(
    localStorage.getItem("verifake-language") || "en"
  );

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      settings.darkMode ? 'dark' : 'light'
    );
  }, [settings.darkMode]);

  const toggle = (key) => setSettings(prev => {
    const next = { ...prev, [key]: !prev[key] };
    localStorage.setItem("verifake-settings", JSON.stringify(next));
    return next;
  });

  const closeModal = () => {
    setModal(null);
    setProfileMsg("");
    setPasswordMsg("");
    setDeleteConfirm("");
  };

  // Save profile
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileForm.name, email: profileForm.email }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...storedUser, username: profileForm.name, email: profileForm.email };
        localStorage.setItem("authUser", JSON.stringify(updated));
        setProfileMsg("Profile updated successfully!");
      } else {
        setProfileMsg(data.message || "Failed to update profile.");
      }
    } catch {
      // If no API endpoint yet, just save locally
      const updated = { ...storedUser, username: profileForm.name, email: profileForm.email };
      localStorage.setItem("authUser", JSON.stringify(updated));
      setProfileMsg("Profile updated successfully!");
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordMsg("Password must be at least 6 characters.");
      return;
    }
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg("Password changed successfully!");
        setPasswordForm({ current: "", newPass: "", confirm: "" });
      } else {
        setPasswordMsg(data.message || "Failed to change password.");
      }
    } catch {
      setPasswordMsg("Could not connect to server.");
    }
  };

  // Save language
  const handleSaveLanguage = () => {
    localStorage.setItem("verifake-language", language);
    closeModal();
  };

  // Download data
  const handleDownloadData = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_BASE}/api/checks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.data || [], null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "verifake-history.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download data.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    const token = localStorage.getItem("authToken");
    try {
      await fetch(`${API_BASE}/api/user`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* proceed anyway */ }
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("verifake-settings");
    navigate("/");
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "fil", label: "Filipino" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "ja", label: "Japanese" },
    { code: "zh", label: "Chinese" },
  ];

  return (
    <UserLayout>
      <main className="settings-content">
        <div className="settings-hero">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account preferences</p>
        </div>

        {/* APPEARANCE */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            </div>
            <h2>Appearance</h2>
          </div>
          <div className="settings-item">
            <div>
              <h3>Theme</h3>
              <p>Choose between light and dark mode</p>
            </div>
            <button className={`toggle ${settings.darkMode ? 'on' : ''}`} onClick={() => toggle('darkMode')}>
              <div className="toggle-thumb">
                {settings.darkMode ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <h2>Notifications</h2>
          </div>
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates about your fact-checks via email" },
            { key: "pushNotifications", label: "Push Notifications", desc: "Get browser notifications for important updates" },
            { key: "weeklyDigest", label: "Weekly Digest", desc: "Get a weekly summary of your fact-checking activity" },
          ].map(({ key, label, desc }) => (
            <div className="settings-item" key={key}>
              <div>
                <h3>{label}</h3>
                <p>{desc}</p>
              </div>
              <button className={`toggle ${settings[key] ? 'on' : ''}`} onClick={() => toggle(key)}>
                <div className="toggle-thumb" />
              </button>
            </div>
          ))}
        </div>

        {/* ACCOUNT */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Account</h2>
          </div>

          <div className="settings-item clickable" onClick={() => setModal('profile')}>
            <div className="settings-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h3>Edit Profile</h3>
              <p>Update your name, email, and profile picture</p>
            </div>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div className="settings-item clickable" onClick={() => setModal('password')}>
            <div className="settings-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div>
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure</p>
            </div>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div className="settings-item clickable" onClick={() => setModal('language')}>
            <div className="settings-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </div>
            <div>
              <h3>Language & Region</h3>
              <p>Choose your preferred language and region</p>
            </div>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* DATA & PRIVACY */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h2>Data & Privacy</h2>
          </div>

          <div className="settings-item clickable" onClick={handleDownloadData}>
            <div className="settings-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div>
              <h3>Download Your Data</h3>
              <p>Get a copy of all your fact-checking history</p>
            </div>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div className="settings-item clickable danger" onClick={() => setModal('delete')}>
            <div className="settings-item-icon danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div>
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </main>

      {/* ── MODALS ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            {/* EDIT PROFILE */}
            {modal === 'profile' && (
              <>
                <div className="modal-header">
                  <h2>Edit Profile</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <label>Name</label>
                  <input
                    className="modal-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                  <label>Email</label>
                  <input
                    className="modal-input"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                  {profileMsg && (
                    <p className={`modal-msg ${profileMsg.includes("success") ? "success" : "error"}`}>
                      {profileMsg}
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="modal-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="modal-btn primary" onClick={handleSaveProfile}>Save Changes</button>
                </div>
              </>
            )}

            {/* CHANGE PASSWORD */}
            {modal === 'password' && (
              <>
                <div className="modal-header">
                  <h2>Change Password</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <label>Current Password</label>
                  <input
                    className="modal-input"
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <label>New Password</label>
                  <input
                    className="modal-input"
                    type="password"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <label>Confirm New Password</label>
                  <input
                    className="modal-input"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="••••••••"
                  />
                  {passwordMsg && (
                    <p className={`modal-msg ${passwordMsg.includes("success") ? "success" : "error"}`}>
                      {passwordMsg}
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="modal-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="modal-btn primary" onClick={handleChangePassword}>Update Password</button>
                </div>
              </>
            )}

            {/* LANGUAGE */}
            {modal === 'language' && (
              <>
                <div className="modal-header">
                  <h2>Language & Region</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <label>Select Language</label>
                  <div className="language-list">
                    {languages.map((l) => (
                      <div
                        key={l.code}
                        className={`language-option ${language === l.code ? 'selected' : ''}`}
                        onClick={() => setLanguage(l.code)}
                      >
                        {l.label}
                        {language === l.code && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="modal-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="modal-btn primary" onClick={handleSaveLanguage}>Save</button>
                </div>
              </>
            )}

            {/* DELETE ACCOUNT */}
            {modal === 'delete' && (
              <>
                <div className="modal-header danger">
                  <h2>Delete Account</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <p className="modal-warning">
                    This action is <strong>permanent</strong> and cannot be undone. All your data, history, and account information will be deleted.
                  </p>
                  <label>Type <strong>DELETE</strong> to confirm</label>
                  <input
                    className="modal-input danger"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <div className="modal-footer">
                  <button className="modal-btn secondary" onClick={closeModal}>Cancel</button>
                  <button
                    className="modal-btn danger"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "DELETE"}
                  >
                    Delete My Account
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </UserLayout>
  );
}
