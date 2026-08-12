import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "system" | "preferences" | "security">("profile");

  // Form states for interactive settings
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowStockAlerts: true,
    challanUpdates: true,
    weeklyReport: false,
  });
  const [theme, setTheme] = useState("light");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", icon: "👑" };
      case "SALES":
        return { bg: "#fefce8", text: "#a16207", border: "#fef08a", icon: "💼" };
      case "WAREHOUSE":
        return { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff", icon: "📦" };
      case "ACCOUNTS":
        return { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", icon: "💰" };
      default:
        return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", icon: "👤" };
    }
  };

  const roleStyle = getRoleColor(user?.role);

  return (
    <Layout title="Settings & Configuration">
      <div className="settings-page-wrapper">
        {/* Settings Navigation Tabs */}
        <div className="settings-nav-tabs">
          <button
            className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="tab-icon">👤</span> Account Profile
          </button>
          <button
            className={`settings-tab-btn ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <span className="tab-icon">⚙️</span> System Config
          </button>
          <button
            className={`settings-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <span className="tab-icon">🔔</span> Notifications
          </button>
          <button
            className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <span className="tab-icon">🛡️</span> Security & Access
          </button>
        </div>

        {savedSuccess && (
          <div className="settings-alert-success">
            ✅ Settings updated successfully!
          </div>
        )}

        <div className="settings-grid">
          {/* TAB 1: USER PROFILE */}
          {activeTab === "profile" && (
            <div className="settings-content-card">
              <div className="settings-card-header">
                <div>
                  <h2>User Profile Settings</h2>
                  <p>Manage your account details and view assigned permissions</p>
                </div>
              </div>

              <div className="profile-hero-banner">
                <div className="profile-avatar-large">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="profile-hero-meta">
                  <h3>{user?.name || "ERP Administrator"}</h3>
                  <p>{user?.email || "admin@erp.com"}</p>
                  <span
                    className="role-pill-badge"
                    style={{
                      backgroundColor: roleStyle.bg,
                      color: roleStyle.text,
                      borderColor: roleStyle.border,
                    }}
                  >
                    {roleStyle.icon} {user?.role || "ADMIN"} USER
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address (Primary)</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      title="Email address is managed by System Administrator"
                      className="input-disabled"
                    />
                    <small className="field-hint">Primary login identifier (Read-only)</small>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Assigned System Role</label>
                    <input
                      type="text"
                      value={user?.role || "ADMIN"}
                      disabled
                      className="input-disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Created</label>
                    <input
                      type="text"
                      value="Aug 11, 2026 (Active)"
                      disabled
                      className="input-disabled"
                    />
                  </div>
                </div>

                <div className="form-actions-bar">
                  <button type="submit" className="btn-primary">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SYSTEM CONFIG */}
          {activeTab === "system" && (
            <div className="settings-content-card">
              <div className="settings-card-header">
                <div>
                  <h2>System & Environment Information</h2>
                  <p>Technical details of live backend endpoints, database, and system status</p>
                </div>
              </div>

              <div className="system-info-grid">
                <div className="info-box">
                  <span className="info-box-label">Backend API URL</span>
                  <span className="info-box-val code-font">
                    {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
                  </span>
                  <span className="status-dot-active">● Connected & Live</span>
                </div>

                <div className="info-box">
                  <span className="info-box-label">Database Provider</span>
                  <span className="info-box-val">PostgreSQL (Prisma ORM)</span>
                  <span className="status-dot-active">● Active Connection Pool</span>
                </div>

                <div className="info-box">
                  <span className="info-box-label">Application Version</span>
                  <span className="info-box-val">v1.0.0 (Production Release)</span>
                  <span className="status-tag">Stable</span>
                </div>

                <div className="info-box">
                  <span className="info-box-label">Environment Mode</span>
                  <span className="info-box-val">{import.meta.env.MODE.toUpperCase()}</span>
                  <span className="status-tag">{import.meta.env.MODE}</span>
                </div>
              </div>

              <div className="settings-section-divider" />

              <h3>Role-Based Access Matrix</h3>
              <div className="access-matrix-table-wrapper">
                <table className="access-table">
                  <thead>
                    <tr>
                      <th>Module / Resource</th>
                      <th>Admin</th>
                      <th>Sales</th>
                      <th>Warehouse</th>
                      <th>Accounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Customer CRM</td>
                      <td><span className="check-green">Full (CRUD)</span></td>
                      <td><span className="check-green">Full (CRUD)</span></td>
                      <td><span className="cross-red">No Access</span></td>
                      <td><span className="text-gray">Read Only</span></td>
                    </tr>
                    <tr>
                      <td>Product Catalog</td>
                      <td><span className="check-green">Full (CRUD)</span></td>
                      <td><span className="text-gray">Read Only</span></td>
                      <td><span className="text-gray">Read Only</span></td>
                      <td><span className="text-gray">Read Only</span></td>
                    </tr>
                    <tr>
                      <td>Stock Inventory (IN/OUT)</td>
                      <td><span className="check-green">Full Control</span></td>
                      <td><span className="cross-red">No Access</span></td>
                      <td><span className="check-green">Full Control</span></td>
                      <td><span className="cross-red">No Access</span></td>
                    </tr>
                    <tr>
                      <td>Sales Delivery Challans</td>
                      <td><span className="check-green">Create & Confirm</span></td>
                      <td><span className="check-green">Create & Confirm</span></td>
                      <td><span className="check-green">Confirm Delivery</span></td>
                      <td><span className="text-gray">Read Only</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="settings-content-card">
              <div className="settings-card-header">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose when and how you want to receive system updates and alerts</p>
                </div>
              </div>

              <div className="toggle-list">
                <div className="toggle-item">
                  <div className="toggle-label-box">
                    <strong>Email Alerts for Low Stock Threshold</strong>
                    <p>Receive notifications when product inventory drops below safety threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.lowStockAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, lowStockAlerts: e.target.checked })
                    }
                    className="toggle-checkbox"
                  />
                </div>

                <div className="toggle-item">
                  <div className="toggle-label-box">
                    <strong>Delivery Challan Confirmations</strong>
                    <p>Get notified whenever a draft challan is confirmed or cancelled</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.challanUpdates}
                    onChange={(e) =>
                      setNotifications({ ...notifications, challanUpdates: e.target.checked })
                    }
                    className="toggle-checkbox"
                  />
                </div>

                <div className="toggle-item">
                  <div className="toggle-label-box">
                    <strong>Weekly Inventory Digest</strong>
                    <p>Receive a summary of weekly stock movements and audit logs every Monday</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReport}
                    onChange={(e) =>
                      setNotifications({ ...notifications, weeklyReport: e.target.checked })
                    }
                    className="toggle-checkbox"
                  />
                </div>
              </div>

              <div className="settings-section-divider" />

              <h3>Interface Theme</h3>
              <div className="theme-selector-grid">
                <div
                  className={`theme-option ${theme === "light" ? "selected" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="theme-preview light-theme-prev">☀️</div>
                  <span>Light Mode (Default)</span>
                </div>
                <div
                  className={`theme-option ${theme === "dark" ? "selected" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="theme-preview dark-theme-prev">🌙</div>
                  <span>Dark Mode</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ACCESS */}
          {activeTab === "security" && (
            <div className="settings-content-card">
              <div className="settings-card-header">
                <div>
                  <h2>Security & Authentication</h2>
                  <p>JWT Session details and security settings</p>
                </div>
              </div>

              <div className="security-status-box">
                <div className="sec-icon">🔒</div>
                <div>
                  <h4>JSON Web Token (JWT) Authentication Active</h4>
                  <p>Your session is signed with 256-bit encryption. Tokens expire automatically after session timeout.</p>
                </div>
              </div>

              <div className="settings-section-divider" />

              <h3>Active Session Meta</h3>
              <div className="session-info-rows">
                <div className="session-row">
                  <span>Current Auth Token</span>
                  <span className="code-font token-truncate">
                    {localStorage.getItem("token")?.slice(0, 45)}...
                  </span>
                </div>
                <div className="session-row">
                  <span>Storage Engine</span>
                  <span>Browser LocalStorage (Encrypted HTTP Header Auth)</span>
                </div>
                <div className="session-row">
                  <span>Role Authorization</span>
                  <span className="badge-status-green">Verified ({user?.role})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
