// /src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all components
import Home from "./pages/Home"; // ✅ New import
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Upload from "./components/Upload";
import EmployeeTable from "./components/EmployeeTable";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Default route → Home page */}
        <Route path="/" element={<Home />} />

        {/* ✅ Login route */}
        <Route path="/login" element={<Login />} />

        {/* Register route */}
        <Route path="/register" element={<Register />} />

        {/* Upload CSV route */}
        <Route path="/upload" element={<Upload />} />

        {/* Employee Table route */}
        <Route path="/employees" element={<EmployeeTable />} />
      </Routes>
    </Router>
  );
}

export default App;
