import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { logoutUser } from '@/services/authService';
import { ROUTES } from '@/config/constants';
import { calculateLevel, getLevelTitle, xpProgress } from '@/utils/gameLogic';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (!user) return null;

  const level = calculateLevel(user.xp);
  const levelTitle = getLevelTitle(level);
  const progress = xpProgress(user.xp);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-6">Профиль</h1>

      {/* Profile Card */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{user.displayName}</h2>
            <p className="text-dark-400">{user.email}</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-dark-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-dark-300">Уровень {level}</span>
            <span className="text-primary-400 font-semibold">{levelTitle}</span>
          </div>
          <div className="w-full bg-dark-600 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-full h-3 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-dark-400 text-sm mt-2">{Math.round(progress)}% до следующего уровня</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm mb-1">Опыт</p>
          <p className="text-2xl font-bold text-white">{user.xp}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm mb-1">Баллы</p>
          <p className="text-2xl font-bold text-white">{user.points}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm mb-1">Групп</p>
          <p className="text-2xl font-bold text-white">{user.groupIds.length}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm mb-1">Достижений</p>
          <p className="text-2xl font-bold text-white">{user.achievementIds.length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => navigate(ROUTES.STATS)}
          className="w-full bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl p-4 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white font-medium">Статистика</span>
          </div>
          <span className="text-dark-500 group-hover:text-dark-400">→</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-xl p-4 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-medium">Выйти</span>
          </div>
        </button>
      </div>
    </div>
  );
}
