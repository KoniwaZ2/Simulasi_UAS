import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import SellerPage from "./components/SellerPage";
import BuyerPage from "./components/BuyerPage";
import { registerUser } from "./services/register";
import { getCart } from "./services/cart";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [cartData, setCartData] = useState(null);

  useEffect(() => {
    const checkExtistingAuth = () => {
      const accessToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_data");

      if (accessToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          if (userData.role === "customer") {
            fetchCartData(userData, accessToken);
          }
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
          localStorage.removeItem("user_data");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setIsCheckingAuth(false);
    };

    checkExtistingAuth();
  }, []);

  const fetchCartData = async (userData, token) => {
    try {
      console.log("Fetching cart for user ID:", userData.id);
      const cart = await getCart(userData.id, token);
      console.log("Cart data received:", cart);
      setCartData(cart);
    } catch (cartError) {
      console.error("Failed to fetch cart:", cartError);
      console.error("Cart error details:", cartError.response?.data);
    }
  };

  const handleLoginSuccess = async (data) => {
    try {
      const accessToken = data.access;
      const refreshToken = data.refresh;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        role: data.role,
      };
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);

      if (userData.role === "customer") {
        await fetchCartData(userData, accessToken);
      } else {
        setCartData(null);
      }
    } catch (error) {
      console.error("Post-login handling failed:", error);
      throw error;
    }
  };

  const handleRegisterSubmit = async (formData) => {
    try {
      const data = await registerUser(
        formData.username,
        formData.email,
        formData.password,
        formData.password_confirmation,
        formData.first_name,
        formData.last_name,
        formData.phone_number,
        formData.role
      );
      console.log("Registration response:", data);
      setShowLogin(true); // Switch to login after successful registration
      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setShowLogin(true);
  };

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {user ? (
        user.role === "seller" ? (
          <SellerPage user={user} onLogout={handleLogout} />
        ) : (
          <BuyerPage user={user} cartData={cartData} onLogout={handleLogout} />
        )
      ) : showLogin ? (
        <LoginForm
          onLogin={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegisterSubmit}
          onCancel={() => setShowLogin(true)}
        />
      )}
    </div>
  );
}

export default App;
