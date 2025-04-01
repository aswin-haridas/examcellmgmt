
const AddClassroomModal = ({ isOpen, isSubmitting, classroom, error, onChange, onSubmit, onCancel }) => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Classroom</h2>
  
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">
            {error}
          </div>
        )}
  
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Classroom Name
            </label>
            <input
              type="text"
              name="classname"
              value={classroom.classname}
              onChange={onChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g., Room 101"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={classroom.capacity}
              onChange={onChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g., 60"
            />
          </div>
  
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bench Count
            </label>
            <input
              type="number"
              name="bench_count"
              value={classroom.bench_count}
              onChange={onChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g., 30"
            />
          </div>
  
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Classroom"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  export default AddClassroomModal;