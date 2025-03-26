import React from "react";
import Sidebar from "../components/Sidebar"; // Added import for Sidebar

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
    message: "Hall tickets for mid-term exams are now available for download.",
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
  {
    id: 4,
    title: "Result Published",
    message:
      "Results for the previous semester have been published. Check your portal.",
    date: "2023-10-25",
    read: true,
  },
];

const NotificationsPage = () => {
  return (
    <div className="flex">
      <Sidebar /> {/* Added Sidebar */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">All Notifications</h3>
              <p className="text-sm text-gray-500">
                Stay updated with important announcements
              </p>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex items-start ${
                  !notification.read ? "bg-gray-50" : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    !notification.read ? "bg-black" : "bg-gray-300"
                  }`}
                ></div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {notification.date}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button className="text-xs text-gray-600 hover:text-gray-900">
                      Mark as {notification.read ? "unread" : "read"}
                    </button>
                    <button className="text-xs text-gray-600 hover:text-gray-900">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
