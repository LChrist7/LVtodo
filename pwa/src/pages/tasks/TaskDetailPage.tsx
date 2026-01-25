import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getTask, updateTaskStatus, completeTask } from '@/services/taskService';
import { Task } from '@/types';
import { ROUTES } from '@/config/constants';
import { formatTimeRemaining, isTaskLate } from '@/utils/gameLogic';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      try {
        const taskData = await getTask(id);
        setTask(taskData);
      } catch (error) {
        console.error('Failed to load task:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const handleStart = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      await updateTaskStatus(task.id, 'in_progress');
      setTask({ ...task, status: 'in_progress' });
    } catch (error) {
      console.error('Failed to start task:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!task || !user) return;
    setActionLoading(true);
    try {
      const deadline = task.deadline.toDate();
      const late = isTaskLate(deadline);
      await completeTask(task.id, user.id, late);
      navigate(ROUTES.TASKS);
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-dark-400">Задача не найдена</p>
        </div>
      </div>
    );
  }

  const deadline = task.deadline.toDate();
  const late = isTaskLate(deadline);
  const timeRemaining = formatTimeRemaining(deadline);
  const isAssignedToMe = user?.id === task.assignedTo;

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
        <h1 className="text-2xl font-bold text-white">Детали задачи</h1>
      </div>

      {/* Task Card */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
            {task.description && (
              <p className="text-dark-300 leading-relaxed">{task.description}</p>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Сложность</p>
            <p className="text-white font-semibold capitalize">{task.difficulty === 'easy' ? 'Легко' : 'Сложно'}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Награда</p>
            <p className="text-white font-semibold">{task.points} баллов</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Крайний срок</p>
            <div className={`flex items-center gap-2 ${late ? 'text-red-400' : 'text-white'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-semibold">{timeRemaining}</span>
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Статус</p>
            <p className="text-white font-semibold capitalize">
              {task.status === 'pending' && 'Ожидает'}
              {task.status === 'in_progress' && 'В работе'}
              {task.status === 'completed' && 'Выполнено'}
              {task.status === 'confirmed' && 'Подтверждено'}
              {task.status === 'late' && 'Просрочено'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isAssignedToMe && (
          <div className="flex gap-3">
            {task.status === 'pending' && (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Начать</span>
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>Завершить</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
