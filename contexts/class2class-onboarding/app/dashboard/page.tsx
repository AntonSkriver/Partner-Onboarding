export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-4">
          Welcome to Class2Class! You can complete your profile later from the settings menu.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
          <div className="text-amber-500 mr-3 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-amber-800">Complete your profile</h3>
            <p className="text-amber-700 text-sm">
              Your profile is incomplete. Complete it to get the most out of Class2Class and connect with other
              educators.
            </p>
            <a href="/onboarding" className="text-amber-800 font-medium text-sm mt-2 inline-block hover:underline">
              Complete profile now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

