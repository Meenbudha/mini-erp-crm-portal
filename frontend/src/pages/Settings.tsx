import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export function Settings() {
  const { user } = useAuth();

  return (
    <Layout title="System Settings">
      <div className="settings-container">
        <div className="card">
          <div className="card-header">
            <h3>User Profile</h3>
            <p>Your account information and system role</p>
          </div>
          <div className="card-body">
            <div className="profile-detail">
              <div className="avatar-circle-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="profile-info">
                <h4>{user?.name}</h4>
                <p>{user?.email}</p>
                <span className="badge role-badge">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "24px" }}>
          <div className="card-header">
            <h3>System Information</h3>
            <p>Environment and API configurations</p>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">API Endpoint</span>
              <span className="info-value">http://localhost:5000/api</span>
            </div>
            <div className="info-row">
              <span className="info-label">Environment</span>
              <span className="info-value">Development</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
