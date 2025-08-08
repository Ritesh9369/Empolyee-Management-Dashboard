const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  uploadCSV,
  addEmployee,
  getEmployees,
  downloadCSV
} = require("../controllers/employeeController");
const verifyToken = require("../middleware/verifyToken");

// ✅ Multer config for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ✅ Routes
router.post("/upload", upload.single("file"), uploadCSV); // CSV Upload
router.post("/add", addEmployee); // Add Single Employee
router.get("/", verifyToken, getEmployees); // Get Employees (protected)
router.get("/download", downloadCSV); // CSV Download

module.exports = router;
