import React, { useState, useEffect } from "react";
import { getAllProducts } from "../services/products";

function BuyerPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  // Get user info from localStorage
  const storedUser = localStorage.getItem("user_data");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const username = user.first_name || "Guest";
  const userId = user.id;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.product_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      const productsArray = Array.isArray(data) ? data : data.results || [];
      setProducts(productsArray);
      setFilteredProducts(productsArray);
      setError(null);
    } catch (err) {
      setError("Failed to load products. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!userId) {
      alert("Please log in to add items to cart");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/cart-items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: productId,
          quantity: 1,
          user_id: userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");
      alert("Product added to cart successfully!");
    } catch (err) {
      alert("Failed to add product to cart");
      console.error(err);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome, {username}!</h1>
          <p className="text-indigo-100">Discover amazing products for you</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input w-full px-5 py-4 pr-12 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <svg
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner-large"></div>
            <p className="ml-3 text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">
              {searchQuery
                ? "No products match your search."
                : "No products available."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-indigo-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {product.product_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-indigo-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart[product.id] || product.stock === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                        product.stock === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : addingToCart[product.id]
                          ? "bg-indigo-400 text-white cursor-wait"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                      }`}
                    >
                      {addingToCart[product.id] ? (
                        <span className="flex items-center justify-center">
                          <span className="spinner-small mr-2"></span>
                          Adding...
                        </span>
                      ) : product.stock === 0 ? (
                        "Out of Stock"
                      ) : (
                        "Add to Cart"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BuyerPage;
