import axios from "axios";

const API_URL = "http://localhost:8000/api/";

const authHeaders = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.warn("Unable to read token from localStorage", error);
    return {};
  }
};

export const getCart = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}carts/${userId}/`, {
      headers: authHeaders(),
    });
    console.log("Cart response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const response = await axios.post(
      `${API_URL}cart-items/`,
      {
        user_id: userId,
        product: productId,
        quantity,
      },
      {
        headers: authHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    const response = await axios.delete(`${API_URL}cart-items/${cartItemId}/`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await axios.patch(
      `${API_URL}cart-items/${cartItemId}/`,
      {
        quantity,
      },
      {
        headers: authHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Clear entire cart
export const clearCart = async (cartId) => {
  try {
    const response = await axios.delete(`${API_URL}carts/${cartId}/clear/`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

export const checkoutCart = async (cartId) => {
  try {
    const response = await axios.post(
      `${API_URL}checkouts/`,
      {
        cart: cartId,
      },
      {
        headers: authHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during checkout:", error);
    throw error;
  }
};

export const getCheckoutHistory = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}checkouts/user/${userId}/`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching checkout history:", error);
    throw error;
  }
};
