const ClassroomCard = ({ 
  classroom, 
  exam, 
  userRole, 
  invigilationStatus, 
  onInvigilate, 
  onDelete, 
  onViewSeating 
}) => (
  <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 bg-white">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {classroom.classname}
      </h2>
      <span className="text-xs font-mono text-gray-500 bg-gray-100 p-1 rounded">
        ID: {classroom.id.substring(0, 8)}...
      </span>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Capacity:</span>
        <span className="font-medium">{classroom.capacity}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Benches:</span>
        <span className="font-medium">{classroom.bench_count}</span>
      </div>
    </div>

    {/* Display invigilator information if available */}
    {exam?.invigilation?.length > 0 && exam.invigilation[0].faculty && (
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded">
        <p className="font-semibold">Invigilator:</p>
        <p>{exam.invigilation[0].faculty.name}</p>
      </div>
    )}

    {exam && invigilationStatus.examId === exam.id && invigilationStatus.message && (
      <div
        className={`mb-4 p-2 text-sm rounded ${
          invigilationStatus.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        {invigilationStatus.message}
      </div>
    )}

    <div className="flex justify-end space-x-2 mt-4">
      {userRole === "faculty" && (
        <button
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors"
          onClick={onInvigilate}
        >
          Invigilate
        </button>
      )}
      <button
        className="text-white bg-black hover:bg-gray-800 border border-gray-300 px-3 py-1 rounded"
        onClick={onViewSeating}
      >
        View Seating
      </button>
      {userRole === "admin" && (
        <button
          className="text-red-600 hover:text-red-800 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
          onClick={onDelete}
        >
          Delete
        </button>
      )}
    </div>
  </div>
);


export default ClassroomCard;