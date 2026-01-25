import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { createWish } from '@/services/wishService';
import { getUserGroups } from '@/services/groupService';
import { ROUTES } from '@/config/constants';

export default function CreateWishPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { groups, setGroups } = useGameStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      await createWish(title, description, user.id, groupId);
      navigate(ROUTES.WISHES);
    } catch (err: any) {
      setError(err.message || 'Ошибка создания желания');
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
        <h1 className="text-2xl font-bold text-white">Создать желание</h1>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">
              Как работают желания?
            </p>
            <p className="text-blue-200/70 text-sm">
              Вы создаёте желание без указания стоимости. Другие участники группы увидят его
              и предложат свою цену. После 2+ одобрений, желание становится активным с
              утверждённой стоимостью, и вы сможете его "купить" за баллы.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Ужин в ресторане"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Описание *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
              placeholder="Подробное описание вашего желания..."
            />
          </div>

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
            <p className="text-dark-500 text-xs mt-2">
              Члены этой группы смогут предложить стоимость
            </p>
          </div>

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
                <span>Создать желание</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
