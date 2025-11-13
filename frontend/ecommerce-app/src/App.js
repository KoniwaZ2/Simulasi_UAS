import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./components/RegisterForm";
import Login from "./components/LoginForm";
import { registerUser } from "./services/register";
import { login } from "./services/login";
import SellerPage from "./components/SellerPage";
import BuyerPage from "./components/BuyerPage";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkExtistingAuth = () => {
      const accessToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_data");

      if (accessToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
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

  const handleLoginSubmit = async (formData) => {
    try {
      const data = await login(formData.email, formData.password);
      console.log("Login response:", data);

      // Store tokens - backend returns 'access' and 'refresh' directly
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      // Store user data
      const userData = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        role: data.role,
      };
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);

      alert("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.detail) {
        alert(`Login failed: ${error.response.data.detail}`);
      } else {
        alert("Login failed. Please check your credentials.");
      }
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
      // After successful registration, you might want to log them in automatically
      // or switch to the login view
      setShowLogin(true);
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

  const renderDashboard = () => {
    if (!user) return null;

    if (user.role === "seller") {
      return <SellerPage user={user} onLogout={handleLogout} />;
    } else if (user.role === "customer") {
      return <BuyerPage user={user} onLogout={handleLogout} />;
    } else {
      // Role tidak dikenali
      return (
        <div className="dashboard-container">
          <div className="error-container">
            <p className="error-message">Role tidak dikenali: {user.role}</p>
            <button className="btn-retry" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      );
    }
  };

  // Tampilkan loading sementara cek auth
  if (isCheckingAuth) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        renderDashboard()
      ) : showLogin ? (
        <Login
          onSubmit={handleLoginSubmit}
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
