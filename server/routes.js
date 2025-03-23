const express = require("express");
const router = express.Router();

// Auth routes
router.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;

  // Mock authentication - would connect to DB in production
  if (
    role === "student" &&
    email === "student@gmail.com" &&
    password === "student123"
  ) {
    res.json({ success: true, role: "student", token: "mock-student-token" });
  } else if (
    role === "faculty" &&
    email === "faculty@gmail.com" &&
    password === "faculty123"
  ) {
    res.json({ success: true, role: "faculty", token: "mock-faculty-token" });
  } else if (
    role === "admin" &&
    email === "aisat2025@gmail.com" &&
    password === "aisat@123"
  ) {
    res.json({ success: true, role: "admin", token: "mock-admin-token" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Student routes
router.get("/api/student/exams", (req, res) => {
  const upcomingExams = [
    {
      id: 1,
      subject: "Mathematics",
      course: "MATH201",
      date: "2023-11-15",
      time: "10:00 AM - 12:00 PM",
      venue: "Hall A",
      type: "Mid-Term",
    },
    {
      id: 2,
      subject: "Computer Science",
      course: "CS101",
      date: "2023-11-18",
      time: "02:00 PM - 04:00 PM",
      venue: "Lab 3",
      type: "Practical",
    },
    {
      id: 3,
      subject: "Physics",
      course: "PHY101",
      date: "2023-11-22",
      time: "09:00 AM - 11:00 AM",
      venue: "Hall B",
      type: "Final",
    },
  ];

  res.json({ exams: upcomingExams });
});

router.get("/api/student/courses", (req, res) => {
  const courses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      credits: 3,
    },
    {
      id: 2,
      code: "MATH201",
      name: "Calculus II",
      instructor: "Prof. Johnson",
      credits: 4,
    },
    {
      id: 3,
      code: "PHY101",
      name: "Physics I",
      instructor: "Dr. Brown",
      credits: 4,
    },
    {
      id: 4,
      code: "ENG102",
      name: "English Composition",
      instructor: "Prof. Davis",
      credits: 3,
    },
  ];

  res.json({ courses });
});

router.get("/api/student/profile", (req, res) => {
  const profile = {
    name: "John Smith",
    id: "ST12345",
    email: "john.smith@example.edu",
    program: "Bachelor of Computer Science",
    semester: "5th Semester",
    year: "3rd Year",
    dob: "1999-05-15",
    contactNumber: "+1 (555) 123-4567",
    address: "123 University Ave, College Town, CT 98765",
  };

  res.json({ profile });
});

router.get("/api/student/notifications", (req, res) => {
  const notifications = [
    {
      id: 1,
      title: "Exam Timetable Updated",
      message:
        "The final exam schedule has been updated. Please check your exam dates.",
      date: "2023-11-05",
      read: false,
    },
    {
      id: 2,
      title: "Hall Ticket Available",
      message:
        "Hall tickets for mid-term exams are now available for download.",
      date: "2023-11-03",
      read: true,
    },
    {
      id: 3,
      title: "Exam Fee Payment",
      message: "Last date for exam fee payment is November 10, 2023.",
      date: "2023-11-01",
      read: false,
    },
  ];

  res.json({ notifications });
});

router.put("/api/student/settings/password", (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (currentPassword && newPassword) {
    res.json({ success: true, message: "Password updated successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid password data" });
  }
});

router.put("/api/student/settings/notifications", (req, res) => {
  const { preferences } = req.body;

  res.json({
    success: true,
    message: "Notification preferences updated",
    preferences,
  });
});

// Faculty routes
router.get("/api/faculty/exams", (req, res) => {
  const exams = [
    {
      id: 1,
      course: "CS101",
      subject: "Introduction to Computer Science",
      date: "2023-11-15",
      time: "10:00 AM - 12:00 PM",
      venue: "Hall A",
      students: 45,
      status: "Scheduled",
    },
    {
      id: 2,
      course: "CS201",
      subject: "Data Structures",
      date: "2023-11-18",
      time: "02:00 PM - 04:00 PM",
      venue: "Lab 3",
      students: 38,
      status: "Scheduled",
    },
  ];

  res.json({ exams });
});

// Admin routes
router.get("/api/admin/dashboard", (req, res) => {
  const stats = {
    totalStudents: 1250,
    totalFaculty: 75,
    scheduledExams: 28,
    completedExams: 12,
  };

  res.json({ stats });
});

module.exports = router;
