import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Task } from '@/types';
import { getUserTasks, getCreatedTasks } from '@/services/taskService';
import { ROUTES } from '@/config/constants';
import TaskCard from '@/components/tasks/TaskCard';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';
type TabType = 'assigned_to_me' | 'created_by_me';

export default function TasksPage() {
  const user = useAuthStore((state) => state.user);
  const [assignedToMeTasks, setAssignedToMeTasks] = useState<Task[]>([]);
  const [createdByMeTasks, setCreatedByMeTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('assigned_to_me');

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;

      try {
        setError(null);
        const [assignedTasks, createdTasks] = await Promise.all([
          getUserTasks(user.id),
          getCreatedTasks(user.id).catch(err => {
            // If index is still building, return empty array
            if (err.message?.includes('index') || err.message?.includes('building')) {
              console.warn('Index for created tasks is still building');
              return [];
            }
            throw err;
          })
        ]);
        setAssignedToMeTasks(assignedTasks);
        setCreatedByMeTasks(createdTasks);
      } catch (error: any) {
        console.error('Failed to load tasks:', error);
        if (error.message?.includes('index') || error.message?.includes('building')) {
          setError('⏳ Индексы Firebase еще строятся (это займет 5-15 минут после развертывания). Вкладка "От меня" временно недоступна. Вкладка "Мне" работает.');
        } else {
          setError('Не удалось загрузить задачи. Проверьте подключение к интернету.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  const currentTasks = activeTab === 'assigned_to_me' ? assignedToMeTasks : createdByMeTasks;

  const filteredTasks = currentTasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'in_progress') return task.status === 'in_progress';
    if (filter === 'completed')
      return task.status === 'completed' || task.status === 'confirmed' || task.status === 'late';
    return true;
  });

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Все', count: currentTasks.length },
    {
      value: 'pending',
      label: 'Ожидают',
      count: currentTasks.filter((t) => t.status === 'pending').length,
    },
    {
      value: 'in_progress',
      label: 'В работе',
      count: currentTasks.filter((t) => t.status === 'in_progress').length,
    },
    {
      value: 'completed',
      label: 'Завершены',
      count: currentTasks.filter((t) => t.status === 'completed' || t.status === 'confirmed' || t.status === 'late')
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

      {/* Error Message */}
      {error && (
        <div className={`${
          error.includes('⏳')
            ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        } border px-4 py-3 rounded-lg mb-6`}>
          {error}
          {error.includes('⏳') && (
            <div className="mt-2 text-sm">
              <a
                href="https://console.firebase.google.com/project/lvtodo/firestore/indexes"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-300"
              >
                Проверить статус индексов →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('assigned_to_me')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'assigned_to_me'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          Мне ({assignedToMeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('created_by_me')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'created_by_me'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          От меня ({createdByMeTasks.length})
        </button>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

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
