import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/config/constants';
import { calculateLevel, getLevelColor } from '@/utils/gameLogic';

export default function Header() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const level = calculateLevel(user?.xp || 0);
  const levelColor = getLevelColor(level);

  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-800/95 backdrop-blur-sm border-b border-dark-700 z-40">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LV</span>
          </div>
          <span className="font-bold text-white text-lg hidden sm:inline">LVTodo</span>
        </Link>

        {/* User info */}
        <div className="flex items-center gap-4">
          {/* Points */}
          <div className="hidden sm:flex items-center gap-2 bg-dark-700 px-3 py-1.5 rounded-lg">
            <span className="text-2xl">💰</span>
            <span className="font-semibold text-white">{user.points}</span>
          </div>

          {/* Level */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${levelColor}20` }}
          >
            <span className="text-sm font-medium text-dark-300">LVL</span>
            <span className="font-bold" style={{ color: levelColor }}>
              {level}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-dark-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center gap-2 hover:bg-dark-700 px-2 py-1.5 rounded-lg transition-colors"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="hidden md:inline text-white font-medium">
              {user.displayName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
