import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { getUserGroups } from '@/services/groupService';
import { ROUTES } from '@/config/constants';

export default function GroupsPage() {
  const user = useAuthStore((state) => state.user);
  const { groups, setGroups } = useGameStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      if (!user) return;

      try {
        const userGroups = await getUserGroups(user.id);
        setGroups(userGroups);
      } catch (error) {
        console.error('Failed to load groups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [user, setGroups]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Группы</h1>
        <div className="flex gap-2">
          <Link
            to={ROUTES.JOIN_GROUP}
            className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span className="hidden sm:inline">Присоединиться</span>
          </Link>
          <Link
            to={ROUTES.CREATE_GROUP}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Создать</span>
          </Link>
        </div>
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-dark-400 mt-4">Загрузка...</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`${ROUTES.GROUPS}/${group.id}`}
              className="bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-400" />
                </div>
                <div className="bg-dark-700 px-3 py-1 rounded-lg">
                  <span className="text-dark-300 text-sm">{group.memberIds.length}</span>
                </div>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors">
                {group.name}
              </h3>

              {group.description && (
                <p className="text-dark-400 text-sm line-clamp-2 mb-4">{group.description}</p>
              )}

              <div className="flex items-center gap-2 text-dark-500 text-sm">
                <span>Код:</span>
                <code className="bg-dark-700 px-2 py-1 rounded font-mono text-primary-400">
                  {group.inviteCode}
                </code>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400 mb-6">Вы еще не состоите ни в одной группе</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to={ROUTES.CREATE_GROUP}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Создать группу</span>
            </Link>
            <Link
              to={ROUTES.JOIN_GROUP}
              className="inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Присоединиться</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
