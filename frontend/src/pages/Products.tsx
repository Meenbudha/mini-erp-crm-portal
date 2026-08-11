import { useEffect, useState, useCallback, type FormEvent } from "react";
import Layout from "../components/Layout";
import { productApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type {
  Product,
  CreateProductPayload,
  Pagination,
} from "../types";

export function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "",
    sku: "",
    category: "",
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    warehouseLocation: "",
  });

  const fetchProducts = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getProducts({
          page: pageNum,
          limit: 10,
          search: search || undefined,
          category: categoryFilter || undefined,
          lowStock: lowStockFilter || undefined,
        });

        if (response.data.success) {
          setProducts(response.data.data.products);
          setPagination(response.data.data.pagination);
        }
      } catch (err: unknown) {
        console.error("Fetch products error:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    },
    [search, categoryFilter, lowStockFilter]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      category: "",
      unitPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      warehouseLocation: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      warehouseLocation: product.warehouseLocation || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (!formData.sku.trim()) {
      setFormError("SKU is required.");
      return;
    }
    if (!formData.category.trim()) {
      setFormError("Category is required.");
      return;
    }
    if (Number(formData.unitPrice) <= 0) {
      setFormError("Unit price must be greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unitPrice: Number(formData.unitPrice),
          currentStock: Number(formData.currentStock),
          minimumStock: Number(formData.minimumStock),
          warehouseLocation: formData.warehouseLocation,
        });
      } else {
        await productApi.createProduct({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unitPrice: Number(formData.unitPrice),
          currentStock: Number(formData.currentStock),
          minimumStock: Number(formData.minimumStock),
          warehouseLocation: formData.warehouseLocation,
        });
      }
      closeModal();
      fetchProducts(pagination.page);
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
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await productApi.deleteProduct(id);
      fetchProducts(pagination.page);
    } catch (err: unknown) {
      alert("Failed to delete product.");
    }
  };

  const categoriesList = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  return (
    <Layout title="Product Catalog">
      <div className="crm-container">
        {/* HEADER BAR */}
        <div className="page-header-action">
          <div>
            <h2 className="header-title">Products & Catalog</h2>
            <p className="header-subtitle">
              Manage product master data, SKUs, category tags, and stock thresholds.
            </p>
          </div>
          {(user?.role === "ADMIN" || user?.role === "WAREHOUSE" || user?.role === "SALES") && (
            <button onClick={openAddModal} className="btn btn-primary">
              ➕ Add Product
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
                placeholder="Search product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {categoriesList.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select-filter"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`btn-sm filter-toggle-btn ${
                lowStockFilter ? "active-toggle" : ""
              }`}
            >
              ⚠️ Low Stock Only
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found matching your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock Status</th>
                    <th>Location</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLowStock = p.currentStock <= p.minimumStock;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="customer-cell">
                            <span className="product-name">{p.name}</span>
                            <span className="sku-subtitle">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td>
                          <span className="type-badge">{p.category}</span>
                        </td>
                        <td>
                          <span className="price-tag">
                            ${Number(p.unitPrice).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <div className="stock-cell">
                            <span className="stock-val">{p.currentStock} units</span>
                            {isLowStock ? (
                              <span className="status-badge status-lead">
                                ⚠️ Low Stock (Min: {p.minimumStock})
                              </span>
                            ) : (
                              <span className="status-badge status-active">
                                Min: {p.minimumStock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted-sm">
                            📍 {p.warehouseLocation || "Default Warehouse"}
                          </span>
                        </td>
                        <td className="text-right actions-cell">
                          {(user?.role === "ADMIN" ||
                            user?.role === "WAREHOUSE" ||
                            user?.role === "SALES") && (
                            <button
                              onClick={() => openEditModal(p)}
                              className="btn-sm btn-edit"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {user?.role === "ADMIN" && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="btn-sm btn-delete"
                            >
                              🗑
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

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="pagination-buttons">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchProducts(pagination.page - 1)}
                  className="btn-sm"
                >
                  ← Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchProducts(pagination.page + 1)}
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
                <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={closeModal} className="modal-close-btn">
                  ✕
                </button>
              </div>

              {formError && <div className="error mb-4">{formError}</div>}

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Industrial Steel Bolt"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU (Stock Keeping Unit) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BLT-1002"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fasteners, Electronics"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="e.g. 29.99"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Stock</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 100"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentStock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={formData.minimumStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumStock: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Warehouse Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Shelf A-12, Main Depot"
                      value={formData.warehouseLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warehouseLocation: e.target.value,
                        })
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
                      : editingProduct
                      ? "Update Product"
                      : "Create Product"}
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

export default Products;
