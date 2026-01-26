import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getGroup, deleteGroup } from '@/services/groupService';
import { getGroupTasks } from '@/services/taskService';
import { Group, Task } from '@/types';
import { ROUTES } from '@/config/constants';
import TaskCard from '@/components/tasks/TaskCard';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [group, setGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (!id) return;

      // Retry logic with exponential backoff
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const [groupData, groupTasks] = await Promise.all([
            getGroup(id),
            getGroupTasks(id),
          ]);

          if (groupData) {
            setGroup(groupData);
            setTasks(groupTasks);
            setLoading(false);
            return;
          }

          // Wait before retry (exponential backoff: 500ms, 1000ms, 1500ms)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          }
        } catch (error) {
          console.error(`Failed to load group (attempt ${attempt + 1}):`, error);

          // Wait before retry on error too
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          }
        }
      }

      // All retries failed
      setGroup(null);
      setLoading(false);
    };

    loadGroup();
  }, [id]);

  const handleCopyCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !user) return;

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить группу "${group.name}"?\n\n` +
      'Это действие удалит:\n' +
      '• Все задания группы\n' +
      '• Все желания группы\n' +
      '• Саму группу у всех участников\n\n' +
      'Статистика участников (баллы, XP) сохранится.\n\n' +
      'Это действие необратимо!'
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteGroup(group.id, user.id);
      alert('Группа успешно удалена');
      navigate(ROUTES.GROUPS);
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      alert(error.message || 'Не удалось удалить группу');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-dark-400">Группа не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-dark-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">{group.name}</h1>
      </div>

      {/* Group Info */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{group.name}</h3>
              <p className="text-dark-400 text-sm">{group.memberIds.length} участников</p>
            </div>
          </div>
        </div>

        {group.description && (
          <p className="text-dark-300 mb-4">{group.description}</p>
        )}

        <div className="bg-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-2">Код для приглашения:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-dark-800 px-4 py-2 rounded font-mono text-primary-400 text-lg tracking-wider">
              {group.inviteCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        </div>

        {/* Delete Group Button (only for creator) */}
        {user && group.createdBy === user.id && (
          <div className="mt-4 pt-4 border-t border-dark-600">
            <button
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/50 text-red-400 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Удаление...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Удалить группу навсегда</span>
                </>
              )}
            </button>
            <p className="text-dark-500 text-xs text-center mt-2">
              Удалит все задания и желания группы. Действие необратимо.
            </p>
          </div>
        )}
      </div>

      {/* Group Tasks */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Задачи группы</h2>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
            <p className="text-dark-400">В группе пока нет задач</p>
          </div>
        )}
      </div>
    </div>
  );
}
