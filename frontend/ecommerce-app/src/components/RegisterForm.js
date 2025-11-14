import React, { useState, useEffect, useRef } from "react";

function RegisterForm({ onRegister, onCancel, registerToEdit }) {
  const emailInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "customer",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (registerToEdit) {
      setFormData({
        username: registerToEdit.username || "",
        email: registerToEdit.email || "",
        password: "",
        password_confirmation: "",
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
        password_confirmation: "",
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
    setErrorMessage("");
    setIsSubmitting(true);

    const isEditing = Boolean(registerToEdit);
    const passwordsProvided =
      formData.password || formData.password_confirmation;
    const shouldValidatePasswords = !isEditing || passwordsProvided;

    if (
      shouldValidatePasswords &&
      formData.password !== formData.password_confirmation
    ) {
      setErrorMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await onRegister(formData);
      if (!registerToEdit) {
        onCancel?.();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page register-page">
      <div className="login-shell">
        <div className="login-hero register-hero">
          <div className="brand-pill">Simulasi UAS</div>
          <h1>
            Create your account
            <br /> and shop smarter
          </h1>
          <p>
            Your profile connects directly with the buyer dashboard, letting you
            browse products, manage carts, and track checkouts seamlessly.
          </p>
          <div className="hero-grid">
            <div className="hero-card">
              <span className="hero-label">Secure Sign-up</span>
              <strong>2FA ready</strong>
              <small>Protected with encrypted tokens</small>
            </div>
            <div className="hero-card">
              <span className="hero-label">Instant Access</span>
              <strong>1-click</strong>
              <small>Jump straight into your dashboard</small>
            </div>
          </div>
        </div>

        <div className="login-form-panel register-form-panel">
          <header className="login-header">
            <div>
              <p className="eyebrow">Register Portal</p>
              <h2>{registerToEdit ? "Update user" : "Join the marketplace"}</h2>
              <p className="subtext">
                Fill out the details below to activate your account. All fields
                stack neatly for mobile comfort.
              </p>
            </div>
            <div className="shield">Secure</div>
          </header>

          {errorMessage && <div className="form-error">⚠️ {errorMessage}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <label className="register-field">
              <span>Username</span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register-field">
              <span>Email</span>
              <input
                type="email"
                id="email"
                name="email"
                ref={emailInputRef}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register-field">
              <span>Password</span>
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
            </label>

            <label className="register-field">
              <span>Confirm Password</span>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required={!registerToEdit}
                placeholder={
                  registerToEdit ? "Leave blank to keep current password" : ""
                }
              />
            </label>

            <label className="register-field">
              <span>First name</span>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register-field">
              <span>Last name</span>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register-field">
              <span>Phone number</span>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register-field">
              <span>Role</span>
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
            </label>

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating account..."
                : registerToEdit
                ? "Save changes"
                : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" onClick={onCancel}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterForm;
