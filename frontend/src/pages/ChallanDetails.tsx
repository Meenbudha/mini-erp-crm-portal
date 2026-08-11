import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { challanApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Challan } from "../types";

export function ChallanDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchChallan = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await challanApi.getChallanById(id);
      if (response.data.success) {
        setChallan(response.data.data);
      }
    } catch (err: unknown) {
      console.error("Fetch challan error:", err);
      setError("Delivery Challan not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallan();
  }, [fetchChallan]);

  const handleConfirm = async () => {
    if (!challan) return;

    setActionLoading(true);
    setActionError(null);
    try {
      await challanApi.confirmChallan(challan.id);
      fetchChallan();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resErr = err as { response?: { data?: { message?: string } } };
        setActionError(resErr.response?.data?.message || "Confirmation failed.");
      } else {
        setActionError("An unexpected error occurred during confirmation.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!challan) return;
    if (!window.confirm(`Cancel delivery challan ${challan.challanNumber}?`)) return;

    setActionLoading(true);
    setActionError(null);
    try {
      await challanApi.cancelChallan(challan.id);
      fetchChallan();
    } catch (err: unknown) {
      setActionError("Failed to cancel challan.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Challan Details">
        <div className="loading-state">Loading delivery challan details...</div>
      </Layout>
    );
  }

  if (error || !challan) {
    return (
      <Layout title="Challan Details">
        <div className="crm-container">
          <div className="error">{error || "Challan not found"}</div>
          <button onClick={() => navigate("/challans")} className="btn btn-secondary">
            ← Back to Challans
          </button>
        </div>
      </Layout>
    );
  }

  const statusClass =
    challan.status === "CONFIRMED"
      ? "status-active"
      : challan.status === "DRAFT"
      ? "status-lead"
      : "status-inactive";

  const totalAmount =
    challan.items?.reduce((sum, item) => {
      const price = item.product?.unitPrice || 0;
      return sum + price * item.quantity;
    }, 0) || 0;

  return (
    <Layout title={`Challan: ${challan.challanNumber}`}>
      <div className="crm-container">
        {/* NAV BACK */}
        <div className="mb-4">
          <Link to="/challans" className="btn-sm btn-secondary">
            ← Back to All Delivery Challans
          </Link>
        </div>

        {actionError && <div className="error mb-4">{actionError}</div>}

        {/* HEADER CARD */}
        <div className="card mb-4" style={{ marginBottom: "24px" }}>
          <div className="page-header-action" style={{ marginBottom: "0" }}>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="header-title font-mono">{challan.challanNumber}</h2>
                <span className={`status-badge ${statusClass}`}>{challan.status}</span>
              </div>
              <p className="header-subtitle">
                Issued on {new Date(challan.createdAt).toLocaleString()} by{" "}
                <strong>{challan.user?.name || "System User"}</strong>
              </p>
            </div>

            <div className="flex gap-2">
              {challan.status === "DRAFT" &&
                (user?.role === "ADMIN" ||
                  user?.role === "SALES" ||
                  user?.role === "WAREHOUSE") && (
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="btn btn-primary"
                    style={{ backgroundColor: "#16a34a" }}
                  >
                    {actionLoading ? "Processing..." : "✅ Confirm & Deduct Stock"}
                  </button>
                )}

              {challan.status === "DRAFT" &&
                (user?.role === "ADMIN" || user?.role === "SALES") && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ color: "#dc2626" }}
                  >
                    ✖ Cancel Challan
                  </button>
                )}

              <button
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                🖨 Print Challan
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="dashboard-grid mb-4" style={{ marginBottom: "24px" }}>
          {/* CUSTOMER INFO CARD */}
          <div className="card">
            <div className="card-header mb-4">
              <h3>Customer & Consignee Details</h3>
            </div>
            <div className="account-details">
              <div className="account-row">
                <span className="label">Customer Name:</span>
                <span className="val font-bold">
                  {challan.customer?.name || "N/A"}
                </span>
              </div>
              <div className="account-row">
                <span className="label">Business Name:</span>
                <span className="val">
                  {challan.customer?.businessName || "Individual Customer"}
                </span>
              </div>
              <div className="account-row">
                <span className="label">Mobile Phone:</span>
                <span className="val">{challan.customer?.mobile}</span>
              </div>
              <div className="account-row">
                <span className="label">GST Number:</span>
                <span className="val">{challan.customer?.gstNumber || "N/A"}</span>
              </div>
              <div className="account-row">
                <span className="label">Delivery Address:</span>
                <span className="val">
                  {challan.customer?.address || "Default Shipping Address"}
                </span>
              </div>
            </div>
          </div>

          {/* CHALLAN SUMMARY CARD */}
          <div className="card">
            <div className="card-header mb-4">
              <h3>Challan Summary</h3>
            </div>
            <div className="account-details">
              <div className="account-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${statusClass}`}>
                  {challan.status}
                </span>
              </div>
              <div className="account-row">
                <span className="label">Total Quantity:</span>
                <span className="val font-bold">{challan.totalQuantity} Units</span>
              </div>
              <div className="account-row">
                <span className="label">Estimated Total Value:</span>
                <span className="val font-bold text-green">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="card">
          <div className="card-header mb-4">
            <h3>Dispatched Items List</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Dispatched Qty</th>
                  <th className="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {challan.items?.map((item) => {
                  const price = item.product?.unitPrice || 0;
                  const lineTotal = price * item.quantity;
                  return (
                    <tr key={item.id || item.productId}>
                      <td>
                        <span className="font-bold">
                          {item.product?.name || "Product"}
                        </span>
                      </td>
                      <td>
                        <span className="type-badge">
                          {item.product?.sku || "SKU-N/A"}
                        </span>
                      </td>
                      <td>${Number(price).toFixed(2)}</td>
                      <td>
                        <span className="font-bold">{item.quantity} pcs</span>
                      </td>
                      <td className="text-right font-bold text-green">
                        ${lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f8fafc", fontWeight: "bold" }}>
                  <td colSpan={3} className="text-right">
                    Total:
                  </td>
                  <td>{challan.totalQuantity} pcs</td>
                  <td className="text-right text-green" style={{ fontSize: "1.1rem" }}>
                    ${totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChallanDetails;
