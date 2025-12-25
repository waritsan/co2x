'use client';

// eslint-disable-next-line @next/next/no-img-element
import { useAuth } from '@/hooks/useAuth';

export function LoginButton() {
  const { isLoggedIn, login, logout, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user?.pictureUrl && (
            <img
              src={user.pictureUrl}
              alt={user.displayName}
              className="w-8 h-8 rounded-full border-2 border-green-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ccircle cx="100" cy="100" r="100" fill="%2300B900"/%3E%3C/svg%3E';
              }}
            />
          )}
          <span className="text-sm text-gray-700 font-medium hidden sm:inline">{user?.displayName}</span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-[#00B900] hover:bg-[#009900] text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
      title="Login with LINE messaging app"
    >
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 0C5.37 0 0 4.22 0 9.5 0 14.24 4.14 18.21 9.59 18.83v3.51c0 .65.68.89 1.18.49l3.27-2.54c.79.17 1.63.28 2.5.28 6.63 0 12-4.22 12-9.5S18.63 0 12 0zm2.66 10.5h-2.66v2.66h-1.33v-2.66H7.99V9.17h2.66V6.51h1.33v2.66h2.66v1.33z" />
      </svg>
      <span className="hidden sm:inline">Login with LINE</span>
      <span className="sm:hidden">LINE</span>
    </button>
  );
}
