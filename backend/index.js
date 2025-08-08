const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const employeeRoutes = require("./routes/employeeRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MySQL Database Config
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "---------", // your password
  database: "---------", // your database name
});

// ✅ DB Connection
db.connect((err) => {
  if (err) {
    console.log("❌ MySQL connection error", err);
  } else {
    console.log("✅ MySQL connected");
  }
});

// ✅ REGISTER Route
app.post("/api/auth/register", async (req, res) => {
  const { full_name, email, password, mobile } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });

      if (result.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
        [full_name, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Insert error" });
          }
          return res
            .status(201)
            .json({ success: true, message: "Registered successfully" });
        }
      );
    }
  );
});

// ✅ LOGIN Route
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      if (result.length === 0)
        return res.status(400).json({ message: "Invalid email or password" });

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "7d"
        }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email
        }
      });
    }
  );
});
app.use("/api/employees", employeeRoutes);
app.use("/uploads", express.static("uploads"));



// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
