import React, { useState, useEffect } from "react";
import { facultyService } from "../services/api";
import Sidebar from "../components/Sidebar";

const FacultyDashboard = () => {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invigilationDuties, setInvigilationDuties] = useState([]);
  const [facultyAvailability, setFacultyAvailability] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [message, setMessage] = useState("");

  // Generate dates for the next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
      });
    }

    return dates;
  };

  useEffect(() => {
    setAvailableDates(generateDates());
    fetchInvigilationDuties();
    fetchFacultyAvailability();
  }, []);

  const fetchInvigilationDuties = async () => {
    try {
      setLoading(true);
      const duties = await facultyService.getInvigilationDuties();
      setInvigilationDuties(duties);
    } catch (err) {
      setError("Failed to fetch invigilation duties");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyAvailability = async () => {
    try {
      const availability = await facultyService.getAllFacultyAvailability();
      setFacultyAvailability(availability);
    } catch (err) {
      console.error("Failed to fetch faculty availability:", err);
    }
  };

  const toggleDateSelection = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSubmitAvailability = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        setError("User information not found. Please login again.");
        return;
      }

      const availability = selectedDates.map((date) => ({
        faculty_id: user.id,
        date: date,
        status: "available",
      }));

      await facultyService.inputAvailableDates(availability);
      setMessage("Availability submitted successfully!");
      setSelectedDates([]);
      fetchFacultyAvailability();
    } catch (err) {
      setError(`Failed to submit availability: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Faculty Dashboard
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Mark Availability for Invigilation
              </h3>
              <p className="text-sm text-gray-500">
                Select dates when you are available for exam duty
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableDates.map((dateObj) => (
                  <div
                    key={dateObj.date}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedDates.includes(dateObj.date)
                        ? "bg-black text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => toggleDateSelection(dateObj.date)}
                  >
                    <p className="font-medium">{formatDate(dateObj.date)}</p>
                    <p className="text-sm">{dateObj.dayName}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmitAvailability}
                  disabled={loading || selectedDates.length === 0}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? "Submitting..." : "Submit Availability"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">My Invigilation Duties</h3>
              <p className="text-sm text-gray-500">
                Your assigned exam invigilation schedule
              </p>
            </div>
            <div className="p-4">
              {loading ? (
                <p className="text-center py-4">Loading duties...</p>
              ) : invigilationDuties.length > 0 ? (
                <div className="space-y-3">
                  {invigilationDuties.map((duty) => (
                    <div
                      key={duty.id}
                      className="p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{duty.exam_name}</h4>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                          {formatDate(duty.date)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        <strong>Time:</strong> {duty.time}
                      </p>
                      <p className="text-sm">
                        <strong>Venue:</strong> {duty.venue}
                      </p>
                      <div className="mt-2">
                        <button className="text-sm text-blue-600 hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">
                  No invigilation duties assigned yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Faculty Availability Overview
            </h3>
            <p className="text-sm text-gray-500">
              See when other faculty members are available
            </p>
          </div>
          <div className="p-4">
            {facultyAvailability.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faculty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facultyAvailability.map((item) => (
                      <tr key={`${item.faculty_id}-${item.date}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.faculty_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4">No availability data found.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">View Classroom Details</h3>
            </div>
            <div className="p-4">
              <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                View Classrooms
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">View Exam Details</h3>
            </div>
            <div className="p-4">
              <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                View All Exams
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>
            <div className="p-4">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
