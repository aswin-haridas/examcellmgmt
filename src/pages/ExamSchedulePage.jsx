import React from "react";

const exams = [
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
  {
    id: 4,
    subject: "English",
    course: "ENG102",
    date: "2023-11-25",
    time: "01:00 PM - 03:00 PM",
    venue: "Hall C",
    type: "Final",
  },
];

const ExamSchedulePage = () => {
  // Function to format date in a readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Schedule</h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Upcoming Examinations</h3>
          <p className="text-sm text-gray-500">All scheduled exams</p>
        </div>

        <div className="p-4">
          <div className="grid gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-medium">{exam.subject}</h4>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      exam.type === "Final"
                        ? "bg-gray-800 text-white"
                        : exam.type === "Mid-Term"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {exam.type}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-1">
                  <strong>Course Code:</strong> {exam.course}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Date:</strong> {formatDate(exam.date)}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Time:</strong> {exam.time}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Venue:</strong> {exam.venue}
                </p>

                <div className="mt-4 flex space-x-2">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                    Download Hall Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSchedulePage;
