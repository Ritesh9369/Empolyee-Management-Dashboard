import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 4) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      if (res.data.success) {
        setSuccess("✅ User registered successfully!");
        setTimeout(() => navigate("/upload"), 1500);
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div
      className="container-fluid py-5 min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #28a745, #218838)"
      }}
    >
      <motion.div
        className="card shadow-lg p-5 rounded-4 bg-white col-md-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center mb-4 fw-bold text-success">
          <i className="fas fa-user-plus me-2"></i> Register
        </h2>

        {error && <div className="alert alert-danger text-center">{error}</div>}
        {success && (
          <div className="alert alert-success text-center">{success}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="fas fa-user me-2 text-success"></i>Full Name
            </label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              placeholder="Enter your full name"
              required
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="fas fa-envelope me-2 text-success"></i>Email
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="fas fa-phone-alt me-2 text-success"></i>Mobile
              Number
            </label>
            <input
              type="text"
              className="form-control"
              name="mobile"
              placeholder="Enter 10-digit number"
              pattern="[0-9]{10}"
              title="Enter a valid 10-digit number"
              required
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="fas fa-lock me-2 text-success"></i>Password
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Enter password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className="btn btn-success w-100 fw-semibold" type="submit">
            <i className="fas fa-user-plus me-2"></i>Register
          </button>

          <div className="text-center mt-3">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-decoration-none text-success fw-semibold"
            >
              Login
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
