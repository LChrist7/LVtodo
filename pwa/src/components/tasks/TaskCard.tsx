import { Link } from 'react-router-dom';
import { Clock, Flame, Leaf } from 'lucide-react';
import { Task } from '@/types';
import { ROUTES, COLORS } from '@/config/constants';
import { formatTimeRemaining, isTaskLate } from '@/utils/gameLogic';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const deadline = task.deadline.toDate();
  const isLate = isTaskLate(deadline);
  const timeRemaining = formatTimeRemaining(deadline);

  const difficultyConfig = {
    easy: {
      icon: Leaf,
      label: 'Легко',
      color: COLORS.difficulty.easy,
    },
    hard: {
      icon: Flame,
      label: 'Сложно',
      color: COLORS.difficulty.hard,
    },
  };

  const config = difficultyConfig[task.difficulty];
  const DifficultyIcon = config.icon;

  const statusConfig = {
    pending: { label: 'Ожидает', color: COLORS.status.pending },
    in_progress: { label: 'В работе', color: COLORS.status.in_progress },
    completed: { label: 'Выполнено', color: COLORS.status.completed },
    confirmed: { label: 'Подтверждено', color: COLORS.status.confirmed },
    late: { label: 'Просрочено', color: COLORS.status.late },
  };

  const status = statusConfig[task.status];

  return (
    <Link
      to={`${ROUTES.TASKS}/${task.id}`}
      className="block bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-dark-400 text-sm line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Difficulty Badge */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <DifficultyIcon className="w-4 h-4" style={{ color: config.color }} />
          <span className="text-xs font-medium" style={{ color: config.color }}>
            {task.points}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        {/* Deadline */}
        <div
          className={clsx(
            'flex items-center gap-1',
            isLate ? 'text-red-400' : 'text-dark-400'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>{timeRemaining}</span>
        </div>

        {/* Status */}
        <div
          className="px-2 py-1 rounded-lg text-xs font-medium"
          style={{ backgroundColor: `${status.color}20`, color: status.color }}
        >
          {status.label}
        </div>
      </div>
    </Link>
  );
}
