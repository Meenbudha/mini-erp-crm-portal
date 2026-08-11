import { useEffect, useState, useCallback, type FormEvent } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { challanApi, customerApi, productApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Challan, Customer, Product } from "../types";

export function Challans() {
  const { user } = useAuth();

  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: "", quantity: 1 },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [challanRes, custRes, prodRes] = await Promise.all([
        challanApi.getChallans(),
        customerApi.getCustomers({ limit: 100 }),
        productApi.getProducts({ limit: 100 }),
      ]);

      if (challanRes.data.success) {
        setChallans(challanRes.data.data);
      }
      if (custRes.data.success) {
        setCustomers(custRes.data.data.customers);
      }
      if (prodRes.data.success) {
        setProducts(prodRes.data.data.products);
      }
    } catch (err: unknown) {
      console.error("Fetch challans error:", err);
      setError("Failed to load delivery challans.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side search filter
  const filteredChallans = challans.filter((c) => {
    const matchesSearch =
      c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customer?.name && c.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.customer?.businessName && c.customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setSelectedCustomerId(customers.length > 0 ? customers[0].id : "");
    setItems(
      products.length > 0
        ? [{ productId: products[0].id, quantity: 1 }]
        : [{ productId: "", quantity: 1 }]
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      { productId: products.length > 0 ? products[0].id : "", quantity: 1 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "productId" | "quantity",
    value: string | number
  ) => {
    const updated = [...items];
    if (field === "productId") {
      updated[index].productId = value as string;
    } else {
      updated[index].quantity = Math.max(1, Number(value) || 1);
    }
    setItems(updated);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId)) {
      setFormError("All item rows must have a valid product selected.");
      return;
    }

    setSubmitting(true);
    try {
      await challanApi.createChallan({
        customerId: selectedCustomerId,
        items,
      });

      closeModal();
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resErr = err as { response?: { data?: { message?: string } } };
        setFormError(resErr.response?.data?.message || "Failed to create challan.");
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickConfirm = async (id: string) => {
    try {
      await challanApi.confirmChallan(id);
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resErr = err as { response?: { data?: { message?: string } } };
        alert(resErr.response?.data?.message || "Confirmation failed.");
      } else {
        alert("Failed to confirm challan.");
      }
    }
  };

  const handleQuickCancel = async (id: string) => {
    try {
      await challanApi.cancelChallan(id);
      fetchData();
    } catch (err: unknown) {
      alert("Failed to cancel challan.");
    }
  };

  return (
    <Layout title="Sales Delivery Challans">
      <div className="crm-container">
        {/* PAGE HEADER */}
        <div className="page-header-action">
          <div>
            <h2 className="header-title">Sales Delivery Challans</h2>
            <p className="header-subtitle">
              Issue draft sales challans, confirm stock dispatch, and audit order status.
            </p>
          </div>
          {(user?.role === "ADMIN" || user?.role === "SALES") && (
            <button onClick={openCreateModal} className="btn btn-primary">
              ➕ Create Challan
            </button>
          )}
        </div>

        {/* SEARCH & STATUS FILTER BAR */}
        <div className="filter-card">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Challan # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-filter"
            >
              <option value="">All Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading sales challans...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredChallans.length === 0 ? (
            <div className="empty-state">
              <p>No delivery challans match your search or filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChallans.map((c) => {
                    const statusClass =
                      c.status === "CONFIRMED"
                        ? "status-active"
                        : c.status === "DRAFT"
                        ? "status-lead"
                        : "status-inactive";

                    return (
                      <tr key={c.id}>
                        <td>
                          <Link
                            to={`/challans/${c.id}`}
                            className="customer-name-link font-mono font-bold"
                          >
                            {c.challanNumber}
                          </Link>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <span className="font-bold">
                              {c.customer?.name || "N/A"}
                            </span>
                            <span className="company-subtitle">
                              {c.customer?.businessName || c.customer?.mobile}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-bold">{c.totalQuantity} pcs</span>
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <span className="date-tag">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="text-right actions-cell">
                          <Link
                            to={`/challans/${c.id}`}
                            className="btn-sm btn-view"
                          >
                            👁 View
                          </Link>
                          {c.status === "DRAFT" &&
                            (user?.role === "ADMIN" ||
                              user?.role === "SALES" ||
                              user?.role === "WAREHOUSE") && (
                              <button
                                onClick={() => handleQuickConfirm(c.id)}
                                className="btn-sm btn-edit"
                                style={{
                                  backgroundColor: "#f0fdf4",
                                  color: "#16a34a",
                                  borderColor: "#bbf7d0",
                                }}
                              >
                                ✅ Confirm
                              </button>
                            )}
                          {c.status === "DRAFT" &&
                            (user?.role === "ADMIN" || user?.role === "SALES") && (
                              <button
                                onClick={() => handleQuickCancel(c.id)}
                                className="btn-sm btn-delete"
                              >
                                ✖ Cancel
                              </button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CREATE CHALLAN MODAL */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: "680px" }}>
              <div className="modal-header">
                <h3>➕ Create Delivery Challan (Draft)</h3>
                <button onClick={closeModal} className="modal-close-btn">
                  ✕
                </button>
              </div>

              {formError && <div className="error mb-4">{formError}</div>}

              <form onSubmit={handleCreateSubmit} className="modal-form">
                <div className="form-group mb-4">
                  <label>Select Customer *</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="select-filter"
                    style={{ width: "100%" }}
                  >
                    {customers.length === 0 ? (
                      <option value="">No customers found</option>
                    ) : (
                      customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.businessName ? `(${c.businessName})` : ""} —{" "}
                          {c.mobile}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label className="font-semibold text-sm">Challan Line Items</label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="btn-sm btn-view"
                    >
                      ➕ Add Line Item
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          background: "#f8fafc",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <select
                            required
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(idx, "productId", e.target.value)
                            }
                            className="select-filter"
                            style={{ width: "100%" }}
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Stock: {p.currentStock}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ width: "100px" }}>
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", e.target.value)
                            }
                            style={{ width: "100%", padding: "8px" }}
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="btn-sm btn-delete"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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
                  >
                    {submitting ? "Creating..." : "Save Draft Challan"}
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

export default Challans;
