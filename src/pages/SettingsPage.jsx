import React from "react";

const SettingsPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Account Settings</h3>
        </div>

        <div className="p-6">
          <form>
            <div className="mb-6">
              <h4 className="text-md font-medium mb-4">Change Password</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="current-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium mb-4">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    defaultChecked
                    className="h-4 w-4 text-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="email-notifications"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Email Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    defaultChecked
                    className="h-4 w-4 text-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sms-notifications"
                    className="ml-2 text-sm text-gray-700"
                  >
                    SMS Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exam-reminders"
                    defaultChecked
                    className="h-4 w-4 text-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="exam-reminders"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Exam Reminders
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
