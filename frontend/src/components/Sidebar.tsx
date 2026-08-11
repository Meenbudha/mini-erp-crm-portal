import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">⚡</div>
        <span className="logo-text">Mini ERP / CRM</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Customers</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Products</span>
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Inventory</span>
          </NavLink>

          <NavLink
            to="/challans"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">🧾</span>
            <span className="nav-label">Challans</span>
          </NavLink>
        </div>

        <div className="nav-group footer-group">
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">⚙</span>
            <span className="nav-label">Settings</span>
          </NavLink>

          <button onClick={logout} className="nav-item logout-button">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
