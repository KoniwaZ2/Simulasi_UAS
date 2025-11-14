import React, { useRef, useState, useEffect } from "react";
import { login as loginApi } from "../services/login";

function Login({ onLogin, onCancel, loginToEdits }) {
  const emailInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
  }, [loginToEdits]);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    try {
      const data = await loginApi(formData.email, formData.password);
      if (onLogin) {
        await onLogin(data);
      }
      setFormData({ email: "", password: "" });
    } catch (error) {
      const apiMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Unable to login. Please try again.";
      setFormError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-hero">
          <div className="brand-pill">Simulasi UAS</div>
          <h1>
            Welcome back to
            <br /> your smart commerce hub
          </h1>
          <p>
            Track inventory, manage carts, and check out faster with the same
            clean workspace you see after signing in.
          </p>
        </div>
        <div className="login-form-panel">
          <header className="login-header">
            <div>
              <p className="eyebrow">login Portal</p>
              <h2>Sign in to continue</h2>
              <p className="subtext">
                Use the same credentials you registered with to access the
                dashboard experience.
              </p>
            </div>
            <div className="shield">Secure</div>
          </header>

          {formError && <div className="form-error">⚠️ {formError}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label
              className={`floating ${formData.email ? "floating--active" : ""}`}
            >
              <input
                ref={emailInputRef}
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <span className="floating-label">Email address</span>
            </label>

            <label
              className={`floating ${
                formData.password ? "floating--active" : ""
              }`}
            >
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <span className="floating-label">Password</span>
            </label>

            <div className="remember-row">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="ghost-link">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Enter dashboard"}
            </button>
          </form>

          {onCancel && (
            <p className="auth-switch">
              New to the platform?{" "}
              <button type="button" onClick={onCancel}>
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Login;
