const DeleteModal = ({ isOpen, isDeleting, itemName, onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
      <p className="mb-6">
        Are you sure you want to delete classroom{" "}
        <span className="font-semibold">{itemName}</span>? This action cannot be undone and will remove all seating
        arrangements.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting ? (
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
              Deleting...
            </span>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default DeleteModal;