import React, { useRef, useState, useEffect } from "react";

function Login({ onLogin, onCancel, loginToEdits }) {
  const emailInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  useEffect(() => {
    if (loginToEdits) {
      setFormData({
        email: loginToEdits.email || "",
        password: loginToEdits.password || "",
      });
    } else {
      setFormData({
        email: "",
        password: "",
      });
    }
    if (emailInputRef.current) {
      emailInputRef.current.value = "";
    }
  }, [loginToEdits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLogin(formData);
    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            ref={emailInputRef}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default Login;
