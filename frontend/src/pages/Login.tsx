import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const responseErr = err as { response?: { data?: { message?: string } } };
        setError(responseErr.response?.data?.message || "Invalid email or password");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password@123");
    setError(null);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-logo">⚡ Mini ERP / CRM</div>
          <h1>Sign In</h1>
          <p>Enter your credentials to access your portal</p>
        </div>

        {error && <div className="error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@erp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials-box">
          <span className="demo-title">Quick Demo Login:</span>
          <div className="demo-chips">
            <button
              type="button"
              onClick={() => fillCredentials("admin@erp.com")}
              className="chip chip-admin"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("sales@erp.com")}
              className="chip chip-sales"
            >
              💼 Sales
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("warehouse@erp.com")}
              className="chip chip-warehouse"
            >
              📦 Warehouse
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("accounts@erp.com")}
              className="chip chip-accounts"
            >
              💰 Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
