import axios from "axios";

const API_URL = "http://localhost:8000/api/productsproducts/";

// Get access token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Search products
export const searchProducts = async (query) => {
  try {
    const response = await axios.get(`${API_URL}products/?search=${query}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

// Get single product
export const getProduct = async (id) => {
  try {
    const response = await axios.get(`${API_URL}products/${id}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
