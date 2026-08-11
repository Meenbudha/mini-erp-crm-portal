import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { customerApi, productApi, challanApi } from "../services/api";

export function Dashboard() {
  const { user } = useAuth();

  const [customerCount, setCustomerCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [draftChallanCount, setDraftChallanCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardMetrics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoadingStats(true);
    }

    try {
      const [custRes, prodRes, lowStockRes, challanRes] = await Promise.allSettled([
        customerApi.getCustomers({ limit: 1 }),
        productApi.getProducts({ limit: 1 }),
        productApi.getProducts({ lowStock: true, limit: 100 }),
        challanApi.getChallans(),
      ]);

      if (custRes.status === "fulfilled" && custRes.value.data.success) {
        setCustomerCount(custRes.value.data.data.pagination.total);
      }

      if (prodRes.status === "fulfilled" && prodRes.value.data.success) {
        setProductCount(prodRes.value.data.data.pagination.total);
      }

      if (lowStockRes.status === "fulfilled" && lowStockRes.value.data.success) {
        setLowStockCount(lowStockRes.value.data.data.products.length);
      }

      if (challanRes.status === "fulfilled" && challanRes.value.data.success) {
        const drafts = challanRes.value.data.data.filter(
          (c) => c.status === "DRAFT"
        );
        setDraftChallanCount(drafts.length);
      }
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  return (
    <Layout title="Dashboard">
      <div className="dashboard-page">
        {/* WELCOME BANNER WITH REFRESH BUTTON */}
        <div className="welcome-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="welcome-text">
            <h2>Welcome back, {user?.name || "User"}! 👋</h2>
            <p>
              Here is what is happening across your Mini ERP & CRM system today.
            </p>
          </div>
          <div className="welcome-badge" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => loadDashboardMetrics(true)}
              disabled={refreshing || loadingStats}
              className="btn btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "white",
                color: "#1e293b",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              title="Refresh live dashboard metrics"
            >
              <span style={{ display: "inline-block", transform: refreshing ? "rotate(360deg)" : "none", transition: "transform 0.5s ease" }}>
                🔄
              </span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <span className="role-pill">{user?.role || "GUEST"}</span>
          </div>
        </div>

        {/* METRICS / STATS GRID */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon bg-blue">👥</div>
            <div className="metric-details">
              <span className="metric-title">Total Customers</span>
              <span className="metric-value">
                {loadingStats ? "..." : customerCount}
              </span>
              <span className="metric-sub text-green">Registered in CRM</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-purple">📦</div>
            <div className="metric-details">
              <span className="metric-title">Active Products</span>
              <span className="metric-value">
                {loadingStats ? "..." : productCount}
              </span>
              <span className="metric-sub">Catalog items</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-orange">⚠️</div>
            <div className="metric-details">
              <span className="metric-title">Low Stock Alert</span>
              <span className="metric-value text-orange">
                {loadingStats ? "..." : `${lowStockCount} Items`}
              </span>
              <span className="metric-sub text-orange">Requires restock</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-green">🧾</div>
            <div className="metric-details">
              <span className="metric-title">Draft Challans</span>
              <span className="metric-value">
                {loadingStats ? "..." : draftChallanCount}
              </span>
              <span className="metric-sub">Awaiting confirmation</span>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS & RECENT ACTIVITY */}
        <div className="dashboard-grid">
          <div className="card main-card">
            <div className="card-header">
              <h3>Quick Navigation & Shortcuts</h3>
              <p>Direct access to common ERP/CRM operations</p>
            </div>
            <div className="actions-grid">
              <Link to="/customers" className="action-btn">
                <span className="btn-icon">👥</span>
                <span>Manage Customers</span>
              </Link>
              <Link to="/products" className="action-btn">
                <span className="btn-icon">📦</span>
                <span>View Products</span>
              </Link>
              <Link to="/inventory" className="action-btn">
                <span className="btn-icon">📊</span>
                <span>Stock Inventory</span>
              </Link>
              <Link to="/challans" className="action-btn">
                <span className="btn-icon">🧾</span>
                <span>Delivery Challans</span>
              </Link>
            </div>
          </div>

          <div className="card side-card">
            <div className="card-header">
              <h3>Active Session</h3>
            </div>
            <div className="account-details">
              <div className="account-row">
                <span className="label">User:</span>
                <span className="val">{user?.name}</span>
              </div>
              <div className="account-row">
                <span className="label">Email:</span>
                <span className="val">{user?.email}</span>
              </div>
              <div className="account-row">
                <span className="label">Role Privilege:</span>
                <span className="badge role-badge">{user?.role}</span>
              </div>
              <div className="account-row">
                <span className="label">API Status:</span>
                <span className="val text-green">● Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;