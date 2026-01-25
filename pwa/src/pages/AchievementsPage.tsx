import { Trophy, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ACHIEVEMENTS } from '@/config/constants';

export default function AchievementsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Достижения</h1>
        <p className="text-dark-400">
          Разблокировано: {user?.achievementIds.length || 0} из {ACHIEVEMENTS.length}
        </p>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = user?.achievementIds.includes(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`bg-dark-800 border rounded-xl p-6 transition-all ${
                isUnlocked
                  ? 'border-primary-500 shadow-glow'
                  : 'border-dark-700 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                    isUnlocked ? 'bg-primary-600/20' : 'bg-dark-700'
                  }`}
                >
                  {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-dark-500" />}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 ${
                      isUnlocked ? 'text-white' : 'text-dark-500'
                    }`}
                  >
                    {achievement.title}
                  </h3>
                  <p className="text-dark-400 text-sm">{achievement.description}</p>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-3 text-sm">
                {achievement.reward.xp && (
                  <div className="flex items-center gap-1 text-blue-400">
                    <Trophy className="w-4 h-4" />
                    <span>+{achievement.reward.xp} XP</span>
                  </div>
                )}
                {achievement.reward.points && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="text-lg">💰</span>
                    <span>+{achievement.reward.points}</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {!isUnlocked && (
                <div className="mt-4">
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 rounded-full h-2 transition-all"
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <p className="text-dark-500 text-xs mt-1 text-center">Заблокировано</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
