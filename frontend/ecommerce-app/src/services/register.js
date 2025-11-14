import axios from "axios";

const API_URL = "http://localhost:8000/api/users/";

export const registerUser = async (
  username,
  email,
  password,
  first_name,
  last_name,
  phone_number,
  role = "customer"
) => {
  try {
    const payload = {
      username,
      email,
      password,
      first_name,
      last_name,
      phone_number,
      role,
    };
    
    const response = await axios.post(`${API_URL}register/`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
