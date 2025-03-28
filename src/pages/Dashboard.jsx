import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("exams").select("*");
        if (error) throw error;
        setExams(data || []);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-gray-600">Loading exams...</div>
        ) : (
          <>
            <p className="mb-6 text-gray-600">
              Showing {exams.length} scheduled exams
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    {exam.subject}
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subject Code:</span>
                      <span className="font-medium text-gray-700">
                        {exam.subject_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium text-gray-700">
                        {exam.start_time} - {exam.end_time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room:</span>
                      <span className="font-medium text-gray-700">
                        {exam.classroom_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Branch:</span>
                      <span className="font-medium text-gray-700">
                        {exam.branch}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Year/Sem:</span>
                      <span className="font-medium text-gray-700">
                        {exam.year} Year, {exam.sem} Semester
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {exams.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No exams scheduled
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
