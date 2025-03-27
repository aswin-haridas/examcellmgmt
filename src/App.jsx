import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";

function App() {
  return (
    <div className="flex h-screen bg-mono-100">
      <div className="flex-1 p-4">
        {" "}
        {/* Add padding to the content area */}
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<LoginPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
