import React, { useState, useEffect } from "react";
import {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/products";

function SellerPage() {
  const [products, setProducts] = useState([]);
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
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get seller ID from localStorage
  const userData = localStorage.getItem("user_data");
  const sellerId = userData ? JSON.parse(userData).id : null;
  const token = localStorage.getItem("access_token");

  // Fetch seller's products on mount
  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      if (sellerId) {
        const response = await fetch(
          `http://localhost:8000/api/products/?seller=${sellerId}`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.results || []);
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
        // Update existing product
        const response = await fetch(
          `http://localhost:8000/api/products/${editingProduct.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productPayload),
          }
        );

        if (!response.ok) throw new Error("Failed to update product");
        setSuccessMessage("Product updated successfully!");
      } else {
        // Create new product
        const response = await fetch("http://localhost:8000/api/products/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productPayload),
        });

        if (!response.ok) throw new Error("Failed to create product");
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
      const response = await fetch(
        `http://localhost:8000/api/products/${productId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete product");
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          <p className="text-center text-gray-600">
            Please log in to access the seller dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Seller Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your products and inventory
            </p>
          </div>
          <button
            onClick={handleAddNewProduct}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + Add New Product
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
            {successMessage}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>

                {formError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product description"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      {editingProduct ? "Update" : "Add"} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              You haven't added any products yet.
            </p>
            <button
              onClick={handleAddNewProduct}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {product.product_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p
                        className={`text-xl font-bold ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    Added: {new Date(product.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerPage;
