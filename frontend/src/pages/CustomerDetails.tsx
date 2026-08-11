import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { customerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Customer, FollowUpNote } from "../types";

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow-up form
  const [noteText, setNoteText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);

  const fetchCustomerDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getCustomerById(id);
      if (response.data.success) {
        setCustomer(response.data.data);
      }
    } catch (err: unknown) {
      console.error("Fetch customer error:", err);
      setError("Customer not found or failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleAddFollowup = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setNoteError(null);
    setNoteSuccess(null);

    if (!noteText.trim()) {
      setNoteError("Follow-up note text is required.");
      return;
    }

    setSubmittingNote(true);
    try {
      const response = await customerApi.addFollowup(id, {
        note: noteText,
        followUpDate: followUpDate || undefined,
      });

      if (response.data.success) {
        setNoteSuccess("Follow-up note added successfully.");
        setNoteText("");
        setFollowUpDate("");
        fetchCustomerDetails();
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resErr = err as { response?: { data?: { message?: string } } };
        setNoteError(resErr.response?.data?.message || "Failed to add note.");
      } else {
        setNoteError("Failed to add follow-up note.");
      }
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Customer Details">
        <div className="loading-state">Loading customer profile...</div>
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout title="Customer Details">
        <div className="card">
          <div className="error mb-4">{error || "Customer not found"}</div>
          <button onClick={() => navigate("/customers")} className="btn btn-secondary">
            ← Back to Customers
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Customer: ${customer.name}`}>
      <div className="details-container">
        {/* BREADCRUMB & BACK */}
        <div className="details-top-bar">
          <Link to="/customers" className="back-link">
            ← Back to Customers
          </Link>
        </div>

        {/* PROFILE HEADER CARD */}
        <div className="profile-header-card">
          <div className="profile-main-info">
            <div className="avatar-xl">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="name-status-row">
                <h2>{customer.name}</h2>
                <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                  {customer.status}
                </span>
                <span className="type-badge">{customer.customerType}</span>
              </div>
              {customer.businessName && (
                <p className="business-name-text">🏢 {customer.businessName}</p>
              )}
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="details-grid">
          {/* LEFT COLUMN: INFO CARDS */}
          <div className="info-column">
            <div className="card">
              <div className="card-header">
                <h3>Contact & Business Info</h3>
              </div>
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Mobile Phone</span>
                  <span className="detail-value">📞 {customer.mobile}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{customer.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GST Number</span>
                  <span className="detail-value">{customer.gstNumber || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next Follow-Up Date</span>
                  <span className="detail-value">
                    {customer.followUpDate
                      ? new Date(customer.followUpDate).toLocaleDateString()
                      : "Not Scheduled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-header">
                <h3>Address & Notes</h3>
              </div>
              <div className="details-list">
                <div className="detail-item full-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{customer.address || "No address specified"}</span>
                </div>
                <div className="detail-item full-item">
                  <span className="detail-label">Initial Notes</span>
                  <span className="detail-value">{customer.notes || "No initial notes"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FOLLOW-UP CRM SECTION */}
          <div className="followup-column">
            <div className="card">
              <div className="card-header">
                <h3>CRM Follow-Up Notes</h3>
                <p>Track interaction history and schedule follow-up actions.</p>
              </div>

              {/* ADD NOTE FORM */}
              {(user?.role === "ADMIN" || user?.role === "SALES") && (
                <form onSubmit={handleAddFollowup} className="add-note-form">
                  {noteError && <div className="error">{noteError}</div>}
                  {noteSuccess && <div className="success-banner">{noteSuccess}</div>}

                  <div className="form-group">
                    <label>Add New Interaction Note *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Called customer regarding quote #102. Interested in wholesale discount."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Set Next Follow-Up Date (Optional)</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingNote}
                    className="btn btn-primary btn-block"
                  >
                    {submittingNote ? "Adding Note..." : "Add Follow-Up Note"}
                  </button>
                </form>
              )}

              {/* TIMELINE OF NOTES */}
              <div className="notes-timeline">
                <h4>Interaction History</h4>
                {!customer.followups || customer.followups.length === 0 ? (
                  <p className="no-notes-text">No follow-up notes recorded yet.</p>
                ) : (
                  <div className="timeline-list">
                    {customer.followups.map((f: FollowUpNote) => (
                      <div key={f.id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-meta">
                            <span className="author-name">
                              👤 {f.user?.name || "Team Member"}
                            </span>
                            <span className="note-date">
                              {new Date(f.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="note-text">{f.note}</p>
                          {f.followUpDate && (
                            <span className="next-date-badge">
                              Next Contact: {new Date(f.followUpDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CustomerDetails;
