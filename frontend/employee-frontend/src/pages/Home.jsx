// /src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #00c6ff, #0072ff)",
        padding: "40px"
      }}
    >
      <motion.div
        className="text-center bg-white text-dark p-5 rounded-4 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <h1 className="fw-bold text-primary mb-4">
          👋 Welcome to Employee Dashboard
        </h1>
        <p className="mb-4 text-secondary">
          Please login to continue managing employees.
        </p>

        <button
          className="btn btn-primary fw-semibold"
          onClick={() => navigate("/login")}
        >
          <i className="fas fa-sign-in-alt me-2"></i> Go to Login
        </button>
      </motion.div>
    </div>
  );
};

export default Home;
