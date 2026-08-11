import { useEffect, useState, useCallback, type FormEvent } from "react";
import Layout from "../components/Layout";
import { stockApi, productApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { StockMovement, Product, StockMovementType } from "../types";

export function Inventory() {
  const { user } = useAuth();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("");

  // Modal State
  const [modalType, setModalType] = useState<StockMovementType | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [movementsRes, productsRes] = await Promise.all([
        stockApi.getMovements(selectedProductFilter || undefined),
        productApi.getProducts({ limit: 100 }),
      ]);

      if (movementsRes.data.success) {
        setMovements(movementsRes.data.data);
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.data.products);
      }
    } catch (err: unknown) {
      console.error("Fetch inventory error:", err);
      setError("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, [selectedProductFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Overview Metrics Calculation
  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minimumStock
  ).length;
  const totalUnits = products.reduce((sum, p) => sum + p.currentStock, 0);

  const openStockModal = (type: StockMovementType, selectedProdId?: string) => {
    setModalType(type);
    setProductId(selectedProdId || (products.length > 0 ? products[0].id : ""));
    setQuantity(1);
    setReason("");
    setFormError(null);
  };

  const closeModal = () => {
    setModalType(null);
    setFormError(null);
  };

  const handleStockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!productId) {
      setFormError("Please select a product.");
      return;
    }
    if (quantity <= 0) {
      setFormError("Quantity must be at least 1.");
      return;
    }

    const selectedProd = products.find((p) => p.id === productId);
    if (modalType === "OUT" && selectedProd && quantity > selectedProd.currentStock) {
      setFormError(
        `Insufficient stock! Only ${selectedProd.currentStock} units available for ${selectedProd.name}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      if (modalType === "IN") {
        await stockApi.stockIn({ productId, quantity, reason });
      } else if (modalType === "OUT") {
        await stockApi.stockOut({ productId, quantity, reason });
      }

      closeModal();
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resErr = err as { response?: { data?: { message?: string } } };
        setFormError(resErr.response?.data?.message || "Stock movement failed.");
      } else {
        setFormError("An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Stock Inventory">
      <div className="crm-container">
        {/* PAGE HEADER */}
        <div className="page-header-action">
          <div>
            <h2 className="header-title">Stock Inventory & Movement Control</h2>
            <p className="header-subtitle">
              Overview of product stock levels, warehouse allocations, and audit history.
            </p>
          </div>
          {(user?.role === "ADMIN" || user?.role === "WAREHOUSE") && (
            <div className="flex gap-2" style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => openStockModal("IN")}
                className="btn btn-primary"
                style={{ backgroundColor: "#16a34a" }}
              >
                📥 Stock IN
              </button>
              <button
                onClick={() => openStockModal("OUT")}
                className="btn btn-primary"
                style={{ backgroundColor: "#dc2626" }}
              >
                📤 Stock OUT
              </button>
            </div>
          )}
        </div>

        {/* 1. STOCK OVERVIEW WIDGETS */}
        <div className="metrics-grid" style={{ marginBottom: "28px" }}>
          <div className="metric-card">
            <div className="metric-icon bg-purple">📦</div>
            <div className="metric-details">
              <span className="metric-title">Total Products</span>
              <span className="metric-value">
                {loading ? "..." : totalProducts}
              </span>
              <span className="metric-sub">Catalog Items</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-orange">⚠️</div>
            <div className="metric-details">
              <span className="metric-title">Low Stock</span>
              <span className="metric-value text-orange">
                {loading ? "..." : `${lowStockCount} Items`}
              </span>
              <span className="metric-sub text-orange">Action Required</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-blue">📊</div>
            <div className="metric-details">
              <span className="metric-title">Total Units</span>
              <span className="metric-value text-green">
                {loading ? "..." : totalUnits}
              </span>
              <span className="metric-sub">Units in Stock</span>
            </div>
          </div>
        </div>

        {/* 2. INVENTORY MASTER TABLE */}
        <div className="card mb-6" style={{ marginBottom: "28px" }}>
          <div className="card-header mb-4" style={{ marginBottom: "16px" }}>
            <h3>Inventory Stock Table</h3>
            <p className="text-muted-sm">
              Live stock levels across all catalog products and warehouse locations.
            </p>
          </div>

          {loading ? (
            <div className="loading-state">Loading inventory stock data...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products registered in inventory.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current Stock</th>
                    <th>Minimum Stock</th>
                    <th>Warehouse</th>
                    <th>Status</th>
                    {(user?.role === "ADMIN" || user?.role === "WAREHOUSE") && (
                      <th className="text-right">Stock Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isOutOfStock = p.currentStock === 0;
                    const isLowStock = p.currentStock <= p.minimumStock;

                    const statusBadge = isOutOfStock ? (
                      <span className="status-badge status-inactive">🔴 Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="status-badge status-lead">⚠️ Low Stock</span>
                    ) : (
                      <span className="status-badge status-active">🟢 In Stock</span>
                    );

                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="product-name">{p.name}</span>
                        </td>
                        <td>
                          <span className="type-badge">{p.sku}</span>
                        </td>
                        <td>
                          <span
                            className={`font-bold ${
                              isOutOfStock
                                ? "text-red"
                                : isLowStock
                                ? "text-orange"
                                : "text-green"
                            }`}
                          >
                            {p.currentStock} units
                          </span>
                        </td>
                        <td>
                          <span className="text-muted-sm">{p.minimumStock} units</span>
                        </td>
                        <td>
                          <span className="text-muted-sm">
                            📍 {p.warehouseLocation || "Default Warehouse"}
                          </span>
                        </td>
                        <td>{statusBadge}</td>
                        {(user?.role === "ADMIN" || user?.role === "WAREHOUSE") && (
                          <td className="text-right actions-cell">
                            <button
                              onClick={() => openStockModal("IN", p.id)}
                              className="btn-sm btn-view"
                              style={{ color: "#15803d", borderColor: "#bbf7d0" }}
                            >
                              + IN
                            </button>
                            <button
                              onClick={() => openStockModal("OUT", p.id)}
                              className="btn-sm btn-delete"
                            >
                              - OUT
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. STOCK MOVEMENT HISTORY */}
        <div className="card">
          <div
            className="page-header-action"
            style={{ marginBottom: "16px", alignItems: "center" }}
          >
            <div>
              <h3>Stock Movement History</h3>
              <p className="text-muted-sm">
                Chronological log of all Stock IN and Stock OUT transactions.
              </p>
            </div>

            <div className="filter-group" style={{ display: "flex", gap: "10px" }}>
              <label className="text-muted-sm font-semibold">Filter by Product:</label>
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="select-filter"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading movement audit log...</div>
          ) : movements.length === 0 ? (
            <div className="empty-state">
              <p>No stock movement records found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Product & SKU</th>
                    <th>IN / OUT</th>
                    <th>Quantity</th>
                    <th>Reason / Reference</th>
                    <th>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => {
                    const isStockIn = m.type === "IN";
                    return (
                      <tr key={m.id}>
                        <td>
                          <span className="date-tag">
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <span className="product-name">
                              {m.product?.name || "Product"}
                            </span>
                            <span className="sku-subtitle">
                              SKU: {m.product?.sku || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              isStockIn ? "status-active" : "status-lead"
                            }`}
                          >
                            {isStockIn ? "📥 STOCK IN" : "📤 STOCK OUT"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`font-bold ${
                              isStockIn ? "text-green" : "text-orange"
                            }`}
                          >
                            {isStockIn ? `+${m.quantity}` : `-${m.quantity}`} units
                          </span>
                        </td>
                        <td>
                          <span className="text-muted-sm">
                            {m.reason || "Manual inventory adjustment"}
                          </span>
                        </td>
                        <td>
                          <span className="user-name">
                            {m.user?.name || "System"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* STOCK IN / OUT MODAL */}
        {modalType && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: "480px" }}>
              <div className="modal-header">
                <h3>{modalType === "IN" ? "📥 Record Stock IN" : "📤 Record Stock OUT"}</h3>
                <button onClick={closeModal} className="modal-close-btn">
                  ✕
                </button>
              </div>

              {formError && <div className="error mb-4">{formError}</div>}

              <form onSubmit={handleStockSubmit} className="modal-form">
                <div className="form-group mb-4">
                  <label>Select Product *</label>
                  <select
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="select-filter"
                    style={{ width: "100%" }}
                  >
                    {products.length === 0 ? (
                      <option value="">No products available</option>
                    ) : (
                      products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — Available: {p.currentStock}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="form-group mb-4">
                  <label>Reason / Reference Notes</label>
                  <input
                    type="text"
                    placeholder={
                      modalType === "IN"
                        ? "e.g. Received shipment, Supplier invoice #1024"
                        : "e.g. Sales delivery, Damaged goods removal"
                    }
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{
                      backgroundColor: modalType === "IN" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {submitting
                      ? "Processing..."
                      : modalType === "IN"
                      ? "Add Stock"
                      : "Deduct Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Inventory;
