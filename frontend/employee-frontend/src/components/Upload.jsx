import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Alert,
  Card,
  Row,
  Col,
  Container
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // ✅ Imported for animation
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    designation: "",
    joining_date: ""
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateForm = () => {
    const { full_name, email, phone } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const newErrors = {};

    if (!full_name.trim()) newErrors.full_name = "Full Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format.";
    if (phone && !phoneRegex.test(phone))
      newErrors.phone = "Must be 10 digits.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showMessage("danger", "❗ Fix validation errors.");
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length > 10) return;
      setFormData({ ...formData, phone: cleaned });
      cleaned.length !== 10
        ? setErrors({ ...errors, phone: "Must be 10 digits." })
        : setErrors((prev) => {
            const { phone, ...rest } = prev;
            return rest;
          });
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/employees/add",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showMessage("success", res.data.message || "✅ Employee added!");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        designation: "",
        joining_date: ""
      });
    } catch (err) {
      showMessage("danger", err.response?.data?.message || "❌ Add failed.");
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!file) return showMessage("danger", "❗ Choose a CSV file.");
    const csvFormData = new FormData();
    csvFormData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/employees/upload",
        csvFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );
      showMessage("success", res.data.message || "✅ CSV uploaded!");
      setFile(null);
    } catch (err) {
      showMessage(
        "danger",
        err.response?.data?.message || "❌ CSV upload failed."
      );
    }
  };

  return (
    <Container
      fluid
      style={{
        background: "linear-gradient(135deg, #00c6ff, #0072ff)",
        minHeight: "100vh",
        padding: "40px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-4 rounded-4 w-100"
        style={{
          maxWidth: "1150px",
          background: "#ffffff",
          boxShadow: "0 0 25px rgba(0,0,0,0.1)"
        }}
      >
        <h4 className="text-center fw-bold mb-3 text-primary">
          📁 HR Data Entry Panel
        </h4>

        {message.text && (
          <Alert
            variant={message.type}
            className="text-center fs-6 fw-semibold"
          >
            {message.text}
          </Alert>
        )}

        <div className="text-end mb-3">
          <Button variant="dark" onClick={() => navigate("/employees")}>
            🔍 View All Employees
          </Button>
        </div>

        <Row className="g-4">
          {/* CSV Upload */}
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow border-0 h-100">
                <Card.Header className="bg-primary text-white fw-bold">
                  <i className="fas fa-file-csv me-2"></i>Upload Employees CSV
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleCSVUpload}>
                    <Form.Group controlId="formFile">
                      <Form.Label>Select CSV File</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      type="submit"
                      className="mt-3 w-100 fw-semibold"
                    >
                      <i className="fas fa-upload me-2"></i>Upload CSV
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* Manual Form */}
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="shadow border-0 h-100">
                <Card.Header className="bg-success text-white fw-bold">
                  <i className="fas fa-user-plus me-2"></i>Manually Add Employee
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleManualSubmit}>
                    {[
                      {
                        label: "Full Name *",
                        icon: "fas fa-user",
                        name: "full_name",
                        required: true
                      },
                      {
                        label: "Email *",
                        icon: "fas fa-envelope",
                        name: "email",
                        type: "email",
                        required: true
                      },
                      {
                        label: "Phone",
                        icon: "fas fa-phone",
                        name: "phone",
                        type: "text",
                        maxLength: 10
                      },
                      {
                        label: "Designation",
                        icon: "fas fa-briefcase",
                        name: "designation"
                      },
                      {
                        label: "Joining Date",
                        icon: "fas fa-calendar-alt",
                        name: "joining_date",
                        type: "date"
                      }
                    ].map((field, idx) => (
                      <Form.Group key={idx} className="mb-2">
                        <Form.Label>
                          <i className={`${field.icon} me-1 text-success`}></i>{" "}
                          {field.label}
                        </Form.Label>
                        <Form.Control
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          isInvalid={!!errors[field.name]}
                          required={field.required}
                          maxLength={field.maxLength}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[field.name]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    ))}

                    <Button
                      variant="success"
                      type="submit"
                      className="w-100 fw-semibold"
                    >
                      <i className="fas fa-plus-circle me-2"></i>Add Employee
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
}

export default Upload;
