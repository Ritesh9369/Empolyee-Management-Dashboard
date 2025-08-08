const fs = require("fs");
const csv = require("csv-parser");
const db = require("../config/db");

// ✅ 1. Upload CSV
exports.uploadCSV = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file is missing." });
  }

  const employees = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const { full_name, email, phone, designation, joining_date } = row;

      // ✅ Skip if full_name or email is missing
      if (!full_name || !email) return;

      employees.push([
        full_name.trim(),
        email.trim(),
        phone ? phone.trim() : null,
        designation ? designation.trim() : null,
        joining_date || null
      ]);
    })
    .on("end", () => {
      if (employees.length === 0) {
        return res
          .status(400)
          .json({ message: "No valid employee data found in CSV." });
      }

      const sql = `
        INSERT INTO employees (full_name, email, phone, designation, joining_date)
        VALUES ?`;

      db.query(sql, [employees], (err, result) => {
        if (err) {
          console.error("CSV import failed:", err);
          return res.status(500).json({ message: "CSV import failed." });
        }

        res.status(200).json({
          success: true,
          message: `${employees.length} employees imported successfully!`
        });
      });
    })
    .on("error", (err) => {
      console.error("CSV parsing error:", err);
      return res.status(500).json({ message: "Error reading CSV file." });
    });
};

// ✅ 2. Add employee manually
exports.addEmployee = (req, res) => {
  const { full_name, email, phone, designation, joining_date } = req.body;

  if (!full_name || !email) {
    return res
      .status(400)
      .json({ message: "Full name and email are required." });
  }

  const sql = `
    INSERT INTO employees (full_name, email, phone, designation, joining_date)
    VALUES (?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      full_name,
      email,
      phone || null,
      designation || null,
      joining_date || null
    ],
    (err, result) => {
      if (err) {
        console.error("Manual insert failed:", err);
        return res.status(500).json({ message: "Failed to add employee." });
      }

      res.status(201).json({ success: true, message: "Employee added!" });
    }
  );
};

// ✅ 3. Get employees with pagination, search, and filters
exports.getEmployees = (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    from = "",
    to = "",
    type = "joining"
  } = req.query;

  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM employees WHERE 1`;
  let countSql = `SELECT COUNT(*) as total FROM employees WHERE 1`;
  const params = [];
  const countParams = [];

  // ✅ Search by name, email, designation
  if (search) {
    sql += ` AND (full_name LIKE ? OR email LIKE ? OR designation LIKE ?)`;
    countSql += ` AND (full_name LIKE ? OR email LIKE ? OR designation LIKE ?)`;
    const searchVal = `%${search}%`;
    params.push(searchVal, searchVal, searchVal);
    countParams.push(searchVal, searchVal, searchVal);
  }

  // ✅ Date range filter
  if (from && to) {
    const column = type === "joining" ? "joining_date" : "created_at";
    sql += ` AND ${column} BETWEEN ? AND ?`;
    countSql += ` AND ${column} BETWEEN ? AND ?`;
    params.push(from, to);
    countParams.push(from, to);
  }

  sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.query(countSql, countParams, (countErr, countResult) => {
    if (countErr) {
      console.error("Count query failed:", countErr);
      return res.status(500).json({ message: "Count query failed" });
    }

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("Fetch query failed:", err);
        return res.status(500).json({ message: "Failed to fetch employees" });
      }

      res.status(200).json({
        data: result,
        total: countResult[0].total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit)
      });
    });
  });
};

// ✅ 4. Download employees for CSV export (JSON format)
// backend/controllers/employeeController.js
exports.downloadCSV = async (req, res) => {
  const { search, from, to, type } = req.query;

  let query = "SELECT * FROM employees WHERE 1=1";
  const values = [];

  if (search) {
    query += " AND (full_name LIKE ? OR email LIKE ? OR designation LIKE ?)";
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (from && to && type) {
    const column = type === "joining" ? "joining_date" : "created_at";
    query += ` AND ${column} BETWEEN ? AND ?`;
    values.push(from, to);
  }

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
};
