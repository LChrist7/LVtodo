import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Target, Zap, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { getUserTasks } from '@/services/taskService';
import { getUserGroups } from '@/services/groupService';
import { ROUTES } from '@/config/constants';
import { calculateLevel, xpProgress, getLevelTitle } from '@/utils/gameLogic';
import TaskCard from '@/components/tasks/TaskCard';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const { tasks, setTasks, groups, setGroups } = useGameStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [userTasks, userGroups] = await Promise.all([
          getUserTasks(user.id),
          getUserGroups(user.id),
        ]);

        setTasks(userTasks);
        setGroups(userGroups);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, setTasks, setGroups]);

  if (!user) return null;

  const level = calculateLevel(user?.xp || 0);
  const progress = xpProgress(user?.xp || 0);
  const levelTitle = getLevelTitle(level);

  const activeTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).slice(0, 3);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Привет, {user.displayName}! 👋
        </h1>
        <p className="text-dark-400">Готов выполнить новые задания?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">Уровень</p>
              <p className="text-white text-2xl font-bold">{level}</p>
            </div>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-2">{levelTitle}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-primary-100 text-xs mt-1">{Math.round(progress)}% до следующего</p>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
            <div>
              <p className="text-amber-100 text-sm">Баллы</p>
              <p className="text-white text-2xl font-bold">{user.points}</p>
            </div>
          </div>
          <Link
            to={ROUTES.WISHES}
            className="text-amber-100 text-sm hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Потратить баллы</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tasks Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Активные задачи</p>
              <p className="text-white text-2xl font-bold">{activeTasks.length}</p>
            </div>
          </div>
          <Link
            to={ROUTES.TASKS}
            className="text-blue-100 text-sm hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Все задачи</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Tasks */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-dark-400 mt-4">Загрузка...</p>
        </div>
      ) : (
        <>
          {activeTasks.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary-400" />
                  Активные задачи
                </h2>
                <Link
                  to={ROUTES.TASKS}
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                  Показать все
                </Link>
              </div>
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-dark-500" />
              </div>
              <p className="text-dark-400 mb-4">Нет активных задач</p>
              <Link
                to={ROUTES.CREATE_TASK}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>Создать задачу</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      )}

      {/* Groups Quick Access */}
      {groups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Ваши группы</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.slice(0, 4).map((group) => (
              <Link
                key={group.id}
                to={`${ROUTES.GROUPS}/${group.id}`}
                className="bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-xl p-4 transition-all group"
              >
                <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                  {group.name}
                </h3>
                <p className="text-dark-400 text-sm">{group.memberIds.length} участников</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
