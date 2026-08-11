import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { customerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type {
  Customer,
  CustomerStatus,
  CustomerType,
  CreateCustomerPayload,
  Pagination,
} from "../types";

export function Customers() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<CreateCustomerPayload>({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    notes: "",
  });

  const fetchCustomers = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await customerApi.getCustomers({
          page: pageNum,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
          customerType: typeFilter || undefined,
        });

        if (response.data.success) {
          setCustomers(response.data.data.customers);
          setPagination(response.data.data.pagination);
        }
      } catch (err: unknown) {
        console.error("Fetch customers error:", err);
        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, typeFilter]
  );

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      mobile: "",
      email: "",
      businessName: "",
      gstNumber: "",
      customerType: "RETAIL",
      address: "",
      status: "LEAD",
      notes: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
      businessName: customer.businessName || "",
      gstNumber: customer.gstNumber || "",
      customerType: customer.customerType,
      address: customer.address || "",
      status: customer.status,
      notes: customer.notes || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Customer name is required.");
      return;
    }
    if (!formData.mobile.trim()) {
      setFormError("Mobile number is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerApi.createCustomer(formData);
      }
      closeModal();
      fetchCustomers(pagination.page);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resErr = err as { response?: { data?: { message?: string } } };
        setFormError(resErr.response?.data?.message || "Operation failed.");
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await customerApi.deleteCustomer(id);
      fetchCustomers(pagination.page);
    } catch (err: unknown) {
      alert("Failed to delete customer.");
    }
  };

  return (
    <Layout title="Customers CRM">
      <div className="crm-container">
        {/* HEADER BAR */}
        <div className="page-header-action">
          <div>
            <h2 className="header-title">Customer Database</h2>
            <p className="header-subtitle">
              Manage leads, active clients, contact information, and follow-ups.
            </p>
          </div>
          {(user?.role === "ADMIN" || user?.role === "SALES") && (
            <button onClick={openAddModal} className="btn btn-primary">
              ➕ Add Customer
            </button>
          )}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="filter-card">
          <div className="filter-group">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search name, phone, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-filter"
            >
              <option value="">All Statuses</option>
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-filter"
            >
              <option value="">All Customer Types</option>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading customers...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <p>No customers found matching your criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer / Company</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-Up</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="customer-cell">
                          <Link to={`/customers/${c.id}`} className="customer-name-link">
                            {c.name}
                          </Link>
                          {c.businessName && (
                            <span className="company-subtitle">🏢 {c.businessName}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <span>📞 {c.mobile}</span>
                          {c.email && <span className="email-sub">✉️ {c.email}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="type-badge">{c.customerType}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${c.status.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.followUpDate ? (
                          <span className="date-tag">
                            📅 {new Date(c.followUpDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-sm">-</span>
                        )}
                      </td>
                      <td className="text-right actions-cell">
                        <Link to={`/customers/${c.id}`} className="btn-sm btn-view">
                          👁 View
                        </Link>
                        {(user?.role === "ADMIN" || user?.role === "SALES") && (
                          <button
                            onClick={() => openEditModal(c)}
                            className="btn-sm btn-edit"
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {user?.role === "ADMIN" && (
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="btn-sm btn-delete"
                          >
                            🗑
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="pagination-buttons">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchCustomers(pagination.page - 1)}
                  className="btn-sm"
                >
                  ← Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchCustomers(pagination.page + 1)}
                  className="btn-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ADD / EDIT MODAL */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>
                <button onClick={closeModal} className="modal-close-btn">
                  ✕
                </button>
              </div>

              {formError && <div className="error mb-4">{formError}</div>}

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Business / Company Name</label>
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>GST Number</label>
                    <input
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Customer Type</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerType: e.target.value as CustomerType,
                        })
                      }
                    >
                      <option value="RETAIL">Retail</option>
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as CustomerStatus,
                        })
                      }
                    >
                      <option value="LEAD">LEAD</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      rows={2}
                      placeholder="Street, City, State, ZIP"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Notes / Requirements</label>
                    <textarea
                      rows={2}
                      placeholder="Special instructions or lead notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
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
                    {submitting
                      ? "Saving..."
                      : editingCustomer
                      ? "Update Customer"
                      : "Create Customer"}
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

export default Customers;
