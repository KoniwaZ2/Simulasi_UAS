import axios from "axios";

const API_URL = "http://localhost:8000/api/products/";

// Fetch all products
export const getAllProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Fetch seller's products
export const getSellerProducts = async (sellerId) => {
  try {
    const response = await axios.get(`${API_URL}?seller=${sellerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seller products:", error);
    throw error;
  }
};

// Fetch single product
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}${productId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Create product
export const createProduct = async (productData, token) => {
  try {
    const response = await axios.post(API_URL, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, productData, token) => {
  try {
    const response = await axios.patch(`${API_URL}${productId}/`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId, token) => {
  try {
    const response = await axios.delete(`${API_URL}${productId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const response = await axios.post(`${API_URL}cart-items/`, {
      user_id: userId,
      product: productId,
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};
