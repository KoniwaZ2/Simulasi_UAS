import axios from "axios";

const API_URL = "http://localhost:8000/api/users/register/";

export const registerUser = async (
  username,
  email,
  password,
  password_confirmation,
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
      password_confirmation,
      first_name,
      last_name,
      phone_number,
      role,
    };

    const response = await axios.post(`${API_URL}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
