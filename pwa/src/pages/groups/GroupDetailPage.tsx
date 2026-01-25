import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { getGroup } from '@/services/groupService';
import { getGroupTasks } from '@/services/taskService';
import { Group, Task } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (!id) return;

      try {
        const [groupData, groupTasks] = await Promise.all([
          getGroup(id),
          getGroupTasks(id),
        ]);

        setGroup(groupData);
        setTasks(groupTasks);
      } catch (error) {
        console.error('Failed to load group:', error);
      } finally {
        setLoading(false);
      }
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
