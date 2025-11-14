import React, { useState, useEffect, useRef } from "react";

function RegisterForm({ onRegister, onCancel, registerToEdit }) {
  const emailInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "customer",
  });

  useEffect(() => {
    if (registerToEdit) {
      setFormData({
        username: registerToEdit.username || "",
        email: registerToEdit.email || "",
        password: "",
        first_name: registerToEdit.first_name || "",
        last_name: registerToEdit.last_name || "",
        phone_number: registerToEdit.phone_number || "",
        role: registerToEdit.role || "customer",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        role: "customer",
      });
    }
    if (emailInputRef.current) {
      emailInputRef.current.value = "";
    }
  }, [registerToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRegister(formData);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="register-form-container">
      <h2>{registerToEdit ? "Edit User" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

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
            required={!registerToEdit}
            placeholder={
              registerToEdit ? "Leave blank to keep current password" : ""
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="first_name">First Name:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last Name:</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number:</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            {registerToEdit ? "Update" : "Register"}
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
