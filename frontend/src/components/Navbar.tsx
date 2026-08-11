import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Dashboard" }: NavbarProps) {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="status-indicator" title="API Status">
          <span className="dot online"></span>
          <span className="status-text">System Live</span>
        </div>

        <div className="user-profile-pill">
          <div className="avatar-circle">{getInitials(user?.name)}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            {user?.role && <span className="role-tag">{user.role}</span>}
          </div>
        </div>

        <button onClick={logout} className="topbar-logout-btn" title="Sign out">
          🚪 Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
