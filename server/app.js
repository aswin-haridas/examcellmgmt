const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes"); // Import routes

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Simple route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Exam Cell Management System API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
