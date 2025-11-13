import axios from "axios";

const API_URL = "http://localhost:8000/api/products/";

// Get access token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get user ID from localStorage
const getUserId = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || user.user_id;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

// Get user's cart
export const getCart = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      console.error("User ID not found");
      return null;
    }

    const response = await axios.get(`${API_URL}carts/`, {
      headers: getAuthHeader(),
      params: { user: userId },
    });

    // Return cart for this user
    const userCart = response.data.find((cart) => cart.user === userId);
    return userCart || null;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Add item to cart (auto-creates cart if not exists)
export const addToCart = async (productId, quantity = 1) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User not logged in");
    }

    const response = await axios.post(
      `${API_URL}cart-items/`,
      {
        user_id: userId,
        product: productId,
        quantity: quantity,
      },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axios.patch(
      `${API_URL}cart-items/${itemId}/`,
      { quantity },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    await axios.delete(`${API_URL}cart-items/${itemId}/`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

// Clear cart
export const clearCart = async (cartId) => {
  try {
    await axios.delete(`${API_URL}carts/${cartId}/`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
