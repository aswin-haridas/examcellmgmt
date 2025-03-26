import React from "react";
import { User } from "lucide-react";
import Sidebar from "../components/Sidebar"; // Added import for Sidebar

const ProfilePage = () => {
  const studentInfo = {
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

  return (
    <div className="flex">
      <Sidebar /> {/* Added Sidebar */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Student Profile
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start border-b border-gray-200">
            <div className="bg-gray-200 rounded-full p-6 mb-4 md:mb-0 md:mr-6">
              <User size={64} className="text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-center md:text-left">
                {studentInfo.name}
              </h2>
              <p className="text-gray-600 text-center md:text-left">
                Student ID: {studentInfo.id}
              </p>
              <p className="text-gray-600 text-center md:text-left">
                {studentInfo.program}
              </p>
            </div>
            <div className="ml-auto mt-4 md:mt-0">
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{studentInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">
                  {new Date(studentInfo.dob).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium">{studentInfo.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{studentInfo.address}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Academic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p className="font-medium">{studentInfo.program}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Semester</p>
                <p className="font-medium">{studentInfo.semester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-medium">{studentInfo.year}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
