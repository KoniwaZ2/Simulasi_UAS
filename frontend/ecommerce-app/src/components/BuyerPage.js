import React, { useState, useEffect } from "react";
import { getAllProducts } from "../services/products";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkoutCart,
  getCheckoutHistory,
} from "../services/cart";

function BuyerPage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [pendingProductId, setPendingProductId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [cartError, setCartError] = useState("");
  const [clearingCart, setClearingCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [expandedCheckoutId, setExpandedCheckoutId] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCart();
    // eslint-disable-next-line
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load products:", error);
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const cart = await getCart(user.id);
      setCartData(cart);
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = products.filter(
        (product) =>
          product.product_name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      setCartError("");
      setPendingProductId(productId);
      await addToCart(user.id, productId, 1);
      await loadCart();
      setShowCart(true);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setCartError(
        error.response?.data?.error || "Failed to add product to cart."
      );
    } finally {
      setPendingProductId(null);
    }
  };

  const handleUpdateItemQuantity = async (itemId, newQuantity) => {
    try {
      setCartError("");
      setUpdatingItemId(itemId);
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await updateCartItem(itemId, newQuantity);
      }
      await loadCart();
    } catch (error) {
      console.error("Failed to update cart item:", error);
      setCartError(
        error.response?.data?.error || "Failed to update item quantity."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!cartData?.id) return;
    try {
      setCartError("");
      setCheckoutInfo(null);
      setClearingCart(true);
      await clearCart(cartData.id);
      await loadCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      setCartError(error.response?.data?.error || "Failed to clear cart.");
    } finally {
      setClearingCart(false);
    }
  };

  const handleCheckout = async () => {
    if (!cartData?.id || !cartData.total_items) {
      setCartError("Cart is empty. Add items before checkout.");
      return;
    }
    try {
      setCartError("");
      setCheckingOut(true);
      const result = await checkoutCart(cartData.id);
      setCheckoutInfo({
        id: result.id,
        total: result.total_amount,
        date: result.checkout_date,
        totalItems: result.total_items,
      });
      await loadCart();
    } catch (error) {
      console.error("Checkout failed:", error);
      setCartError(error.response?.data?.error || "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryError("");
      setHistoryLoading(true);
      const history = await getCheckoutHistory(user.id);
      setHistoryData(history);
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistoryError(
        error.response?.data?.error || "Failed to load checkout history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    setShowCart(false);
    setShowHistory(true);
    await loadHistory();
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setHistoryError("");
  };

  const toggleCheckoutDetails = (checkoutId) => {
    setExpandedCheckoutId((prev) => (prev === checkoutId ? null : checkoutId));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <header
        style={{
          background: "white",
          padding: "20px 40px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#333" }}>
            E-Commerce Store
          </h1>
          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
            Welcome, {user.first_name}!
          </p>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button
            onClick={() => setShowCart(!showCart)}
            style={{
              padding: "10px 20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              position: "relative",
            }}
          >
            🛒 Cart
            {cartData && cartData.total_items > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                {cartData.total_items}
              </span>
            )}
          </button>

          <button
            onClick={handleOpenHistory}
            style={{
              padding: "10px 20px",
              background: "#845EC2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            📜 History
          </button>

          <button
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              background: "#ff6b6b",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding: "40px" }}>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 20px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          />
        </div>

        {showCart && (
          <>
            {/* Overlay Background */}
            <div
              onClick={() => setShowCart(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 999,
              }}
            />

            {/* Cart Sidebar */}
            <div
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "450px",
                height: "100vh",
                background: "white",
                boxShadow: "-4px 0 15px rgba(0,0,0,0.3)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Cart Header */}
              <div
                style={{
                  padding: "20px 25px",
                  borderBottom: "2px solid #f0f0f0",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "24px" }}>
                    🛒 Shopping Cart
                  </h2>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "14px",
                      opacity: 0.9,
                    }}
                  >
                    {cartData && cartData.total_items > 0
                      ? `${cartData.total_items} item${
                          cartData.total_items > 1 ? "s" : ""
                        }`
                      : "Empty cart"}
                  </p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "white",
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    fontSize: "24px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.background = "rgba(255, 255, 255, 0.3)")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.background = "rgba(255, 255, 255, 0.2)")
                  }
                >
                  ×
                </button>
              </div>

              {/* Cart Items Container */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 25px",
                }}
              >
                {cartError && (
                  <div
                    style={{
                      background: "#fff3cd",
                      color: "#856404",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      border: "1px solid #ffeeba",
                      marginBottom: "15px",
                      fontSize: "14px",
                    }}
                  >
                    ⚠️ {cartError}
                  </div>
                )}
                {checkoutInfo && (
                  <div
                    style={{
                      background: "#e6fffa",
                      color: "#046c4e",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      border: "1px solid #b2f5ea",
                      marginBottom: "15px",
                      fontSize: "14px",
                    }}
                  >
                    ✅ Checkout #{checkoutInfo.id} completed.
                    <br />
                    Total Items: {checkoutInfo.totalItems} | Total: Rp{" "}
                    {parseFloat(checkoutInfo.total || 0).toLocaleString(
                      "id-ID"
                    )}
                    {checkoutInfo.date && (
                      <>
                        <br />
                        {new Date(checkoutInfo.date).toLocaleString("id-ID")}
                      </>
                    )}
                  </div>
                )}
                {cartData && cartData.items && cartData.items.length > 0 ? (
                  <div>
                    {cartData.items.map((item, index) => {
                      const isUpdating = updatingItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: "20px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "12px",
                            marginBottom: "15px",
                            background:
                              "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            transition: "transform 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform =
                              "translateY(-2px)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                          }
                        >
                          {/* Item Number Badge */}
                          <div
                            style={{
                              display: "inline-block",
                              background: "#667eea",
                              color: "white",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "bold",
                              marginBottom: "10px",
                            }}
                          >
                            ITEM #{index + 1}
                          </div>

                          <h4
                            style={{
                              margin: "0 0 12px 0",
                              fontSize: "18px",
                              color: "#333",
                              fontWeight: "600",
                            }}
                          >
                            {item.product_name}
                          </h4>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ color: "#666", fontSize: "14px" }}>
                                💰 Unit Price:
                              </span>
                              <span
                                style={{ color: "#333", fontWeight: "500" }}
                              >
                                Rp{" "}
                                {parseFloat(item.product_price).toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ color: "#666", fontSize: "14px" }}>
                                📦 Quantity:
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleUpdateItemQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={isUpdating}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    border: "none",
                                    background: "#ff6b6b",
                                    color: "white",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    opacity: isUpdating ? 0.6 : 1,
                                  }}
                                >
                                  −
                                </button>
                                <div
                                  style={{
                                    minWidth: "40px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    color: "#667eea",
                                  }}
                                >
                                  {isUpdating ? "..." : `${item.quantity}x`}
                                </div>
                                <button
                                  onClick={() =>
                                    handleUpdateItemQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={isUpdating}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    border: "none",
                                    background: "#4CAF50",
                                    color: "white",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    opacity: isUpdating ? 0.6 : 1,
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: "8px",
                                paddingTop: "12px",
                                borderTop: "2px dashed #e0e0e0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: "#667eea",
                                  fontWeight: "600",
                                  fontSize: "15px",
                                }}
                              >
                                💵 Subtotal:
                              </span>
                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                  color: "#4CAF50",
                                }}
                              >
                                Rp{" "}
                                {parseFloat(item.total_price).toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "#999",
                    }}
                  >
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>
                      🛒
                    </div>
                    <h3 style={{ color: "#666", marginBottom: "10px" }}>
                      Your cart is empty
                    </h3>
                    <p style={{ fontSize: "14px" }}>
                      Add some products to get started!
                    </p>
                  </div>
                )}
              </div>

              {/* Cart Footer with Total */}
              {cartData && cartData.items && cartData.items.length > 0 && (
                <div
                  style={{
                    padding: "20px 25px",
                    borderTop: "2px solid #f0f0f0",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      padding: "20px",
                      borderRadius: "12px",
                      color: "white",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px", opacity: 0.9 }}>
                        Total Items:
                      </span>
                      <span style={{ fontWeight: "600" }}>
                        {cartData.total_items}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <span style={{ fontSize: "18px", fontWeight: "600" }}>
                        Grand Total:
                      </span>
                      <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                        Rp{" "}
                        {parseFloat(cartData.cart_total).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={handleClearCart}
                      disabled={clearingCart || checkingOut}
                      style={{
                        flex: 1,
                        padding: "13px",
                        background: "#ffe0e0",
                        color: "#c0392b",
                        border: "1px solid #ffb3b3",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor:
                          clearingCart || checkingOut
                            ? "not-allowed"
                            : "pointer",
                        opacity: clearingCart || checkingOut ? 0.7 : 1,
                      }}
                    >
                      {clearingCart ? "Clearing..." : "🗑️ Clear Cart"}
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut || clearingCart}
                      style={{
                        flex: 1,
                        padding: "13px",
                        background:
                          "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor:
                          checkingOut || clearingCart
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.3s",
                        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                        opacity: checkingOut || clearingCart ? 0.85 : 1,
                      }}
                      onMouseOver={(e) => {
                        if (checkingOut || clearingCart) return;
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 16px rgba(76, 175, 80, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(76, 175, 80, 0.3)";
                      }}
                    >
                      {checkingOut ? "Processing..." : "🛍️ Proceed to Checkout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {showHistory && (
          <>
            <div
              onClick={handleCloseHistory}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 999,
              }}
            />

            <div
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "520px",
                height: "100vh",
                background: "white",
                boxShadow: "-4px 0 15px rgba(0,0,0,0.3)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "20px 25px",
                  borderBottom: "2px solid #f0f0f0",
                  background:
                    "linear-gradient(135deg, #845EC2 0%, #D65DB1 100%)",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "24px" }}>
                    📜 Checkout History
                  </h2>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "14px",
                      opacity: 0.9,
                    }}
                  >
                    Track your past purchases and item details.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={loadHistory}
                    disabled={historyLoading}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: historyLoading ? "not-allowed" : "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {historyLoading ? "Refreshing..." : "↻ Refresh"}
                  </button>
                  <button
                    onClick={handleCloseHistory}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "white",
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      fontSize: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 25px",
                  background: "#f9f6ff",
                }}
              >
                {historyError && (
                  <div
                    style={{
                      background: "#fff3cd",
                      color: "#856404",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      border: "1px solid #ffeeba",
                      marginBottom: "15px",
                      fontSize: "14px",
                    }}
                  >
                    ⚠️ {historyError}
                  </div>
                )}

                {historyLoading && !historyData.length ? (
                  <p style={{ color: "#666" }}>Loading history...</p>
                ) : historyData.length > 0 ? (
                  historyData.map((checkout) => (
                    <div
                      key={checkout.id}
                      style={{
                        background: "white",
                        borderRadius: "14px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                        marginBottom: "18px",
                        border: "1px solid #ede7ff",
                      }}
                    >
                      <div
                        style={{
                          padding: "18px 20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                color: "#4a3f8e",
                                fontSize: "18px",
                              }}
                            >
                              Checkout #{checkout.id}
                            </h3>
                            <span
                              style={{ color: "#8a7ab5", fontSize: "13px" }}
                            >
                              {checkout.checkout_date
                                ? new Date(
                                    checkout.checkout_date
                                  ).toLocaleString("id-ID")
                                : "--"}
                            </span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                fontWeight: "600",
                                color: "#4CAF50",
                              }}
                            >
                              Rp{" "}
                              {parseFloat(
                                checkout.total_amount || 0
                              ).toLocaleString("id-ID")}
                            </p>
                            <small style={{ color: "#777" }}>
                              {checkout.total_items || 0} item
                              {checkout.total_items === 1 ? "" : "s"}
                            </small>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleCheckoutDetails(checkout.id)}
                          style={{
                            marginTop: "10px",
                            border: "none",
                            background: "#f0ebff",
                            color: "#5c4d9b",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {expandedCheckoutId === checkout.id
                            ? "Hide details"
                            : "View details"}
                        </button>
                      </div>

                      {expandedCheckoutId === checkout.id && checkout.items && (
                        <div
                          style={{
                            borderTop: "1px solid #f0f0f0",
                            padding: "15px 20px 20px",
                            background: "#fcfbff",
                          }}
                        >
                          {checkout.items.length > 0 ? (
                            checkout.items.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  padding: "12px 0",
                                  borderBottom: "1px dashed #e4defa",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: "15px",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 4px 0",
                                      fontWeight: "600",
                                      color: "#4a3f8e",
                                    }}
                                  >
                                    {item.product_name}
                                  </p>
                                  <small style={{ color: "#7d6fa5" }}>
                                    {item.quantity} × Rp{" "}
                                    {parseFloat(
                                      item.product_price || 0
                                    ).toLocaleString("id-ID")}
                                  </small>
                                </div>
                                <div
                                  style={{
                                    fontWeight: "600",
                                    color: "#4CAF50",
                                  }}
                                >
                                  Rp{" "}
                                  {parseFloat(
                                    item.total_price || 0
                                  ).toLocaleString("id-ID")}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ color: "#888", margin: 0 }}>
                              No item details.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "#8a7ab5",
                    }}
                  >
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>
                      📭
                    </div>
                    <h3 style={{ color: "#5c4d9b", marginBottom: "10px" }}>
                      No checkout history yet
                    </h3>
                    <p style={{ fontSize: "14px" }}>
                      Complete a checkout to see it listed here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>{product.product_name}</h3>
                <p
                  style={{ color: "#666", fontSize: "14px", minHeight: "60px" }}
                >
                  {product.description}
                </p>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#4CAF50",
                    margin: "10px 0",
                  }}
                >
                  Rp {parseFloat(product.price).toLocaleString("id-ID")}
                </p>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Stock: {product.stock}
                </p>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={pendingProductId === product.id}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                    opacity: pendingProductId === product.id ? 0.7 : 1,
                  }}
                >
                  {pendingProductId === product.id
                    ? "Adding..."
                    : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>
            No products found
          </p>
        )}
      </div>
    </div>
  );
}

export default BuyerPage;
