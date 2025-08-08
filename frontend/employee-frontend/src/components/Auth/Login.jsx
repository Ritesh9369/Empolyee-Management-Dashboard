import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      setMessage("✅ Login Successful 🎉");

      setTimeout(() => navigate("/upload"), 1500);
    } catch (error) {
      setMessage("❌ Email or password is incorrect");
    }
  };

  return (
    <div
      className="container-fluid py-5 min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #1E90FF, #007BFF)"
      }}
    >
      <motion.div
        className="card shadow-lg p-4 rounded-4 bg-white text-dark col-md-5"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-center mb-4 fw-bold text-primary">
          <i className="fas fa-user-shield me-2"></i> Admin Login
        </h3>

        {message && (
          <div
            className={`alert ${
              message.includes("✅") ? "alert-success" : "alert-danger"
            } text-center`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-envelope me-2 text-primary"></i>Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-lock me-2 text-primary"></i>Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            <i className="fas fa-sign-in-alt me-2"></i> Login
          </button>

          <div className="text-center mt-3">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-decoration-none text-primary fw-semibold"
            >
              Register here
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
