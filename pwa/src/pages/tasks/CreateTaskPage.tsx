import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { createTask } from '@/services/taskService';
import { getUserGroups } from '@/services/groupService';
import { ROUTES, GAME_CONSTANTS } from '@/config/constants';
import { Timestamp } from 'firebase/firestore';

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { groups, setGroups } = useGameStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [assignedTo, setAssignedTo] = useState('');
  const [groupId, setGroupId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGroups = async () => {
      if (!user) return;
      const userGroups = await getUserGroups(user.id);
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setGroupId(userGroups[0].id);
      }
    };
    loadGroups();
  }, [user, setGroups]);

  const selectedGroup = groups.find((g) => g.id === groupId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const points =
        difficulty === 'easy'
          ? GAME_CONSTANTS.EASY_TASK_POINTS
          : GAME_CONSTANTS.HARD_TASK_POINTS;
      const xp =
        difficulty === 'easy' ? GAME_CONSTANTS.EASY_TASK_XP : GAME_CONSTANTS.HARD_TASK_XP;

      await createTask({
        title,
        description,
        difficulty,
        points,
        xp,
        assignedTo,
        assignedBy: user.id,
        groupId,
        deadline: Timestamp.fromDate(new Date(deadline)),
      });

      navigate(ROUTES.TASKS);
    } catch (err: any) {
      setError(err.message || 'Ошибка создания задачи');
    } finally {
      setLoading(false);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
          <p className="text-dark-400 mb-4">
            Сначала создайте или присоединитесь к группе
          </p>
          <button
            onClick={() => navigate(ROUTES.CREATE_GROUP)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Создать группу</span>
          </button>
        </div>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 1);

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
        <h1 className="text-2xl font-bold text-white">Создать задачу</h1>
      </div>

      {/* Form */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Помыть посуду"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
              placeholder="Подробности задачи..."
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Сложность *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'easy'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                }`}
              >
                <div className="text-2xl mb-2">🍃</div>
                <div className="font-semibold text-white mb-1">Легко</div>
                <div className="text-sm text-dark-400">
                  {GAME_CONSTANTS.EASY_TASK_POINTS} баллов
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'hard'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                }`}
              >
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-semibold text-white mb-1">Сложно</div>
                <div className="text-sm text-dark-400">
                  {GAME_CONSTANTS.HARD_TASK_POINTS} баллов
                </div>
              </button>
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Группа *</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Назначить *
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Выберите участника</option>
              {selectedGroup?.memberIds.map((memberId) => (
                <option key={memberId} value={memberId}>
                  {memberId === user?.id ? 'Себе' : `Участник ${memberId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Крайний срок *
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={minDate.toISOString().slice(0, 16)}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Создание...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Создать задачу</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
