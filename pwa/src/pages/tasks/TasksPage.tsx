import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { getUserTasks } from '@/services/taskService';
import { ROUTES } from '@/config/constants';
import TaskCard from '@/components/tasks/TaskCard';
import { Task } from '@/types';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

export default function TasksPage() {
  const user = useAuthStore((state) => state.user);
  const { tasks, setTasks } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;

      try {
        const userTasks = await getUserTasks(user.id);
        setTasks(userTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user, setTasks]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'in_progress') return task.status === 'in_progress';
    if (filter === 'completed')
      return task.status === 'completed' || task.status === 'confirmed';
    return true;
  });

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Все', count: tasks.length },
    {
      value: 'pending',
      label: 'Ожидают',
      count: tasks.filter((t) => t.status === 'pending').length,
    },
    {
      value: 'in_progress',
      label: 'В работе',
      count: tasks.filter((t) => t.status === 'in_progress').length,
    },
    {
      value: 'completed',
      label: 'Завершены',
      count: tasks.filter((t) => t.status === 'completed' || t.status === 'confirmed')
        .length,
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Задачи</h1>
        <Link
          to={ROUTES.CREATE_TASK}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Создать</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-dark-400 shrink-0" />
        {filters.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all shrink-0 ${
              filter === value
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-dark-400 mt-4">Загрузка...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
          <p className="text-dark-400 mb-4">
            {filter === 'all' ? 'Нет задач' : 'Нет задач в этой категории'}
          </p>
          <Link
            to={ROUTES.CREATE_TASK}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Создать первую задачу</span>
          </Link>
        </div>
      )}
    </div>
  );
}
