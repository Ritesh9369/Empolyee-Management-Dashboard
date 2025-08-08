import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Table,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Container,
  Navbar,
  Nav
} from "react-bootstrap";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [filterDates, setFilterDates] = useState({
    from: "",
    to: "",
    type: "joining"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const employeesPerPage = 5;
  const navigate = useNavigate();
  const csvLinkRef = useRef(); // Ref for CSVLink

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: employeesPerPage,
            search: searchQuery,
            from: filterDates.from,
            to: filterDates.to,
            type: filterDates.type
          }
        });

        setEmployees(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        setError("Failed to load employee data. Check your backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, searchQuery, filterDates]);

  // ✅ Download filtered CSV
  const fetchCSV = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/employees/download",
        {
          params: {
            search: searchQuery,
            from: filterDates.from,
            to: filterDates.to,
            type: filterDates.type
          }
        }
      );

      setCsvData(res.data);

      // Auto-trigger CSV download
      setTimeout(() => {
        if (csvLinkRef.current) {
          csvLinkRef.current.link.click();
        }
      }, 100);
    } catch (err) {
      alert("CSV download failed");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDates({ from: "", to: "", type: "joining" });
    setCurrentPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #eef2f3, #8e9eab)",
        minHeight: "100vh"
      }}
    >
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4">
        <Navbar.Brand className="fw-bold text-white">
          <i className="fas fa-users me-2"></i>Employee Dashboard
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Button variant="outline-light" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-1"></i> Logout
          </Button>
        </Nav>
      </Navbar>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="p-4"
      >
        <Container>
          <Card className="p-4 shadow-lg border-0">
            <h3 className="mb-4 text-center text-primary fw-bold">
              <i className="fas fa-table me-2"></i>Employee Management Table
            </h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="d-flex align-items-center mb-3">
              <Form.Control
                type="text"
                placeholder="Search by name, email, or designation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="ms-2"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Filter Type</Form.Label>
                  <Form.Select
                    value={filterDates.type}
                    onChange={(e) =>
                      setFilterDates({ ...filterDates, type: e.target.value })
                    }
                  >
                    <option value="joining">Joining Date</option>
                    <option value="created">Created Date</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDates.from}
                    onChange={(e) =>
                      setFilterDates({ ...filterDates, from: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDates.to}
                    onChange={(e) =>
                      setFilterDates({ ...filterDates, to: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end gap-2">
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={fetchCSV} className="btn btn-success">
                  <i className="fas fa-download me-1"></i> Download CSV
                </Button>
                {/* Hidden CSVLink */}
                <CSVLink
                  data={csvData}
                  filename="employees.csv"
                  className="d-none"
                  ref={csvLinkRef}
                  target="_blank"
                />
              </Col>
            </Row>

            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark text-center">
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Designation</th>
                        <th>Joining Date</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td>{emp.id}</td>
                          <td>{emp.full_name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.phone}</td>
                          <td>{emp.designation}</td>
                          <td>{emp.joining_date}</td>
                          <td>
                            {emp.created_at
                              ? new Date(emp.created_at).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex justify-content-center my-3">
                  <Button
                    variant="outline-dark"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="mx-2"
                  >
                    Prev
                  </Button>
                  <span className="align-self-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline-dark"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="mx-2"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Container>
      </motion.div>
    </div>
  );
}

export default EmployeeTable;
