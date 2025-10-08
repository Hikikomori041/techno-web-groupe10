'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData {
  message: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
    refreshToken?: string;
  };
}

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userParam = searchParams.get('user');
    
    if (userParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(userParam));
        setUserData(decoded);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to parse user data');
        setIsLoading(false);
      }
    } else {
      setError('No user data found. Please login again.');
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleLogout = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Success!
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
          <p className="text-green-600 dark:text-green-400">✓ {userData.message}</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={userData.user.picture}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {userData.user.firstName} {userData.user.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{userData.user.email}</p>
            </div>
          </div>

          {/* Login Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Login Information:</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-gray-900 dark:text-white">{userData.user.email}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
              <p className="text-gray-900 dark:text-white">
                {userData.user.firstName} {userData.user.lastName}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Access Token</p>
              <p className="text-xs text-gray-900 dark:text-white font-mono break-all">
                {userData.user.accessToken}
              </p>
            </div>

            {userData.user.refreshToken && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Refresh Token</p>
                <p className="text-xs text-gray-900 dark:text-white font-mono break-all">
                  {userData.user.refreshToken}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <a
              href="/"
              className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go to Home
            </a>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

