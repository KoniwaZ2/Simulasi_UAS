import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
// import SellerPage from "./components/SellerPage";
// import BuyerPage from "./components/BuyerPage";
import { login } from "./services/login";
import { registerUser } from "./services/register";

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
      if (data.token) {
        localStorage.setItem("access_token", data.token);
        localStorage.setItem("refresh_token", data.refresh_token);
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
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleRegisterSubmit = async (formData) => {
    try {
      const data = await registerUser(
        formData.username,
        formData.email,
        formData.password,
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
        <div>
          <div
            style={{
              padding: "20px",
              background: "#f5f5f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>
              Welcome, {user.first_name}! ({user.role})
            </h2>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                background: "#ff6b6b",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h3>Login Successful!</h3>
            <p>User ID: {user.id}</p>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone_number}</p>
            <p>Role: {user.role}</p>
            <p style={{ marginTop: "20px", color: "#666" }}>
              {user.role === "seller" ? "Seller Page" : "Buyer Page"} - Coming
              Soon!
            </p>
          </div>
        </div>
      ) : showLogin ? (
        <div>
          <LoginForm
            onLogin={handleLoginSubmit}
            onCancel={() => setShowLogin(false)}
          />
          <p>
            Don't have an account?{" "}
            <button onClick={() => setShowLogin(false)}>Register here</button>
          </p>
        </div>
      ) : (
        <div>
          <RegisterForm
            onRegister={handleRegisterSubmit}
            onCancel={() => setShowLogin(true)}
          />
          <p>
            Already have an account?{" "}
            <button onClick={() => setShowLogin(true)}>Login here</button>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
