import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Target, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getUserStats } from '@/services/taskService';
import { calculateLevel, xpProgress } from '@/utils/gameLogic';

export default function StatsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasksCompleted: 0,
    totalTasksLate: 0,
    totalTasksConfirmed: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        const userStats = await getUserStats(user.id);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const level = calculateLevel(user?.xp || 0);
  const progress = xpProgress(user?.xp || 0);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-dark-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">Статистика</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-green-100 text-sm">Выполнено задач</p>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalTasksCompleted}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <p className="text-orange-100 text-sm">Текущая серия</p>
          </div>
          <p className="text-4xl font-bold text-white">{stats.currentStreak}</p>
          <p className="text-orange-100 text-xs mt-1">Лучшая: {stats.longestStreak}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-purple-100 text-sm">Процент выполнения</p>
          </div>
          <p className="text-4xl font-bold text-white">{stats.completionRate}%</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-red-100 text-sm">Просрочено</p>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalTasksLate}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Прогресс</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-300">Уровень</span>
              <span className="text-white font-semibold">{level}</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div
                className="bg-primary-600 rounded-full h-2"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-300">Опыт (XP)</span>
              <span className="text-white font-semibold">{user?.xp || 0}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-300">Баллы</span>
              <span className="text-white font-semibold">{user?.points || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
