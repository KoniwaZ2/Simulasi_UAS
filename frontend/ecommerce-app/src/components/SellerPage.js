import React, { useState, useEffect, useMemo } from "react";
import {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/products";

const formatCurrency = (value) => {
  const numeric = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numeric);
};

function SellerPage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fallbackUser = (() => {
    try {
      const raw = localStorage.getItem("user_data");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("Unable to parse user data", err);
      return null;
    }
  })();

  const sellerProfile = user || fallbackUser;
  const sellerId = sellerProfile?.id ?? null;
  const sellerName =
    sellerProfile?.first_name || sellerProfile?.username || "Seller";
  const token = localStorage.getItem("access_token");

  // Fetch seller's products on mount
  useEffect(() => {
    if (sellerId) {
      fetchSellerProducts();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredProducts(
      products.filter((product) => {
        const nameMatch = product.product_name?.toLowerCase().includes(term);
        const descMatch = product.description?.toLowerCase().includes(term);
        return nameMatch || descMatch;
      })
    );
  }, [products, searchTerm]);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      if (sellerId) {
        const data = await getSellerProducts(sellerId);
        const normalized = Array.isArray(data) ? data : data.results || [];
        const ownedProducts = normalized.filter((product) => {
          const sellerField = product.seller;
          if (sellerField === undefined || sellerField === null) return false;
          if (typeof sellerField === "object") {
            return String(sellerField.id) === String(sellerId);
          }
          return String(sellerField) === String(sellerId);
        });
        setProducts(ownedProducts);
        setFilteredProducts(ownedProducts);
      }
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      product_name: "",
      description: "",
      price: "",
      stock: "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });
    setFormError(null);
    setShowForm(true);
  };

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, product) => sum + (Number(product.stock) || 0),
      0
    );
    const lowStock = products.filter(
      (product) => (Number(product.stock) || 0) < 5
    ).length;
    return { totalProducts, totalStock, lowStock };
  }, [products]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.product_name.trim()) {
      setFormError("Product name is required");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setFormError("Price must be greater than 0");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setFormError("Stock cannot be negative");
      return;
    }

    try {
      const productPayload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        seller: sellerId,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload, token);
        setSuccessMessage("Product updated successfully!");
      } else {
        await createProduct(productPayload, token);
        setSuccessMessage("Product added successfully!");
      }

      // Refresh products list
      setTimeout(() => {
        fetchSellerProducts();
        setShowForm(false);
      }, 500);
    } catch (err) {
      setFormError(err.message || "An error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(productId, token);
      setSuccessMessage("Product deleted successfully!");
      fetchSellerProducts();
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      console.error(err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      product_name: "",
      description: "",
      price: "",
      stock: "",
    });
    setFormError(null);
  };

  if (!sellerId) {
    return (
      <div className="seller-empty-state">
        <div className="seller-empty-card">
          <p>Please log in to access the seller dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <header className="seller-hero">
        <div>
          <p className="seller-hero__eyebrow">Seller workspace</p>
          <h1>Hi, {sellerName}</h1>
          <p>Control your catalog, pricing, and stock in a single view.</p>
          <div className="seller-hero__meta">
            <span>{stats.totalProducts} live products</span>
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="seller-hero__actions">
          <button className="btn btn-secondary" onClick={fetchSellerProducts}>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleAddNewProduct}>
            + New product
          </button>
          {onLogout && (
            <button className="btn btn-ghost" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      <section className="seller-panel">
        <div className="seller-panel__header">
          <div className="seller-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search product name or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="seller-panel__actions">
            <button className="btn btn-light" onClick={fetchSellerProducts}>
              Sync inventory
            </button>
            <button className="btn btn-primary" onClick={handleAddNewProduct}>
              + Add product
            </button>
          </div>
        </div>

        {error && <div className="seller-message error">{error}</div>}
        {successMessage && (
          <div className="seller-message success">{successMessage}</div>
        )}

        {loading ? (
          <div className="seller-loading">
            <div className="spinner-large" />
            <p>Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="seller-empty-card">
            <h3>No products found</h3>
            <p>
              {products.length === 0
                ? "Start by adding your first product to the catalog."
                : "Try adjusting your search or add something new."}
            </p>
            <button className="btn btn-primary" onClick={handleAddNewProduct}>
              Create product
            </button>
          </div>
        ) : (
          <div className="seller-product-grid">
            {filteredProducts.map((product) => {
              const createdDate = product.created_at
                ? new Date(product.created_at)
                : null;
              const inStock = (Number(product.stock) || 0) > 0;
              return (
                <article key={product.id} className="seller-product-card">
                  <header>
                    <h3>{product.product_name}</h3>
                    <span
                      className={`badge ${
                        inStock ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {inStock ? "In stock" : "Out of stock"}
                    </span>
                  </header>
                  <p className="seller-product-desc">
                    {product.description || "No description provided."}
                  </p>
                  <div className="seller-product-meta">
                    <div>
                      <p className="meta-label">Price</p>
                      <p className="meta-value">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div>
                      <p className="meta-label">Stock</p>
                      <p className="meta-value">{product.stock}</p>
                    </div>
                    <div>
                      <p className="meta-label">Added</p>
                      <p className="meta-value">
                        {createdDate ? createdDate.toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>
                  <footer className="seller-product-actions">
                    <button
                      className="btn btn-light"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <div className="seller-modal" role="dialog" aria-modal="true">
          <div className="seller-modal__overlay" onClick={handleCancelForm} />
          <div className="seller-modal__panel">
            <header className="seller-modal__header">
              <div>
                <p className="seller-modal__eyebrow">
                  {editingProduct ? "Update" : "Create"}
                </p>
                <h2>{editingProduct ? "Update product" : "Add new product"}</h2>
              </div>
              <button
                className="seller-modal__close"
                onClick={handleCancelForm}
              >
                ×
              </button>
            </header>
            {formError && (
              <div className="seller-message error">{formError}</div>
            )}
            <form className="seller-form" onSubmit={handleSubmitForm}>
              <label className="seller-field">
                <span>Product name *</span>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Wireless earbuds"
                  required
                />
              </label>
              <label className="seller-field">
                <span>Description *</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Tell shoppers why this product stands out"
                  required
                />
              </label>
              <div className="seller-form__row">
                <label className="seller-field">
                  <span>Price ($) *</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="39.99"
                    required
                  />
                </label>
                <label className="seller-field">
                  <span>Stock *</span>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                  />
                </label>
              </div>
              <div className="seller-form__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "Save changes" : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerPage;
