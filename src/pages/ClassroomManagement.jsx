import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [formData, setFormData] = useState({
    classname: "",
    capacity: 0,
    location: "",
    features: "",
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const classroomData = await adminService.getAllClassrooms();
      const exams = await adminService.getAllExams();
      const classroomsWithStatus = classroomData.map((classroom) => {
        const isUsedInExams = exams.some(
          (exam) => exam.classroom_id === classroom.id
        );
        return {
          ...classroom,
          status: isUsedInExams ? "In use" : "Available",
        };
      });
      setClassrooms(classroomsWithStatus);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClassroom) {
        await adminService.updateClassroom(currentClassroom.id, formData);
      } else {
        await adminService.addClassroom(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchClassrooms();
    } catch (error) {
      console.error("Error saving classroom:", error);
    }
  };

  const handleEdit = (classroom) => {
    setCurrentClassroom(classroom);
    setFormData({
      classname: classroom.classname,
      capacity: classroom.capacity,
      location: classroom.location || "",
      features: classroom.features || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this classroom?")) {
      try {
        await adminService.deleteClassroom(id);
        fetchClassrooms();
      } catch (error) {
        console.error("Error deleting classroom:", error);
      }
    }
  };

  const resetForm = () => {
    setCurrentClassroom(null);
    setFormData({
      classname: "",
      capacity: 0,
      location: "",
      features: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 w-full">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Classroom Management
            </h1>
            <button
              onClick={openAddModal}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Classroom
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branches
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classrooms.length > 0 ? (
                    classrooms.map((classroom) => (
                      <tr
                        key={classroom.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {classroom.classname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {classroom.capacity}
                          </div>
                        </td>
          
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {classroom.branches || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                              classroom.status === "In use"
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {classroom.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(classroom)}
                            className="text-gray-600 hover:text-gray-900 mr-4 transition-colors"
                            aria-label="Edit classroom"
                          >
                            <Edit className="h-4 w-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(classroom.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            aria-label="Delete classroom"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No classrooms found. Add a classroom to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                    {currentClassroom ? "Edit Classroom" : "Add New Classroom"}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Classroom Name
                    </label>
                    <input
                      type="text"
                      name="classname"
                      value={formData.classname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors text-sm"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Features
                    </label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors text-sm"
                      rows="3"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomManagement;
