// Game mechanics constants
export const GAME_CONSTANTS = {
  EASY_TASK_POINTS: 10,
  HARD_TASK_POINTS: 25,
  EASY_TASK_XP: 15,
  HARD_TASK_XP: 40,
  LATE_PENALTY_MULTIPLIER: 0.5, // 50% points reduction
  XP_PER_LEVEL: 100, // XP needed for each level
  MAX_LEVEL: 100,
};

// Notification timing (percentage of time remaining)
export const NOTIFICATION_THRESHOLDS = {
  PERCENT_80: 0.8,
  PERCENT_50: 0.5,
  PERCENT_30: 0.3,
  PERCENT_5: 0.05,
};

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'Первый шаг',
    description: 'Выполните первое задание',
    icon: '🎯',
    condition: { type: 'tasks_completed' as const, value: 1 },
    reward: { xp: 50, points: 10 }
  },
  {
    id: 'task_master_10',
    title: 'Мастер задач',
    description: 'Выполните 10 заданий',
    icon: '⭐',
    condition: { type: 'tasks_completed' as const, value: 10 },
    reward: { xp: 100, points: 25 }
  },
  {
    id: 'task_master_50',
    title: 'Эксперт задач',
    description: 'Выполните 50 заданий',
    icon: '🌟',
    condition: { type: 'tasks_completed' as const, value: 50 },
    reward: { xp: 300, points: 75 }
  },
  {
    id: 'level_5',
    title: 'Новичок',
    description: 'Достигните 5 уровня',
    icon: '🎓',
    condition: { type: 'level_reached' as const, value: 5 },
    reward: { points: 50 }
  },
  {
    id: 'level_10',
    title: 'Профессионал',
    description: 'Достигните 10 уровня',
    icon: '👑',
    condition: { type: 'level_reached' as const, value: 10 },
    reward: { points: 100 }
  },
  {
    id: 'points_1000',
    title: 'Богач',
    description: 'Накопите 1000 баллов',
    icon: '💰',
    condition: { type: 'points_earned' as const, value: 1000 },
    reward: { xp: 200 }
  },
  {
    id: 'streak_7',
    title: 'Недельная серия',
    description: 'Выполняйте задания 7 дней подряд',
    icon: '🔥',
    condition: { type: 'streak_days' as const, value: 7 },
    reward: { xp: 150, points: 50 }
  },
  {
    id: 'streak_30',
    title: 'Месячная серия',
    description: 'Выполняйте задания 30 дней подряд',
    icon: '🏆',
    condition: { type: 'streak_days' as const, value: 30 },
    reward: { xp: 500, points: 200 }
  },
  {
    id: 'wish_fulfilled',
    title: 'Исполнитель желаний',
    description: 'Купите первое желание',
    icon: '✨',
    condition: { type: 'wishes_purchased' as const, value: 1 },
    reward: { xp: 100 }
  }
];

// Color scheme
export const COLORS = {
  difficulty: {
    easy: '#10B981', // green
    hard: '#EF4444', // red
  },
  status: {
    pending: '#6B7280', // gray
    in_progress: '#3B82F6', // blue
    completed: '#10B981', // green
    confirmed: '#8B5CF6', // purple
    late: '#EF4444', // red
  },
  level: [
    '#94A3B8', // level 1-9
    '#10B981', // level 10-19
    '#3B82F6', // level 20-29
    '#8B5CF6', // level 30-39
    '#F59E0B', // level 40-49
    '#EF4444', // level 50+
  ]
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'lvtodo_theme',
  LANGUAGE: 'lvtodo_language',
  NOTIFICATIONS_ENABLED: 'lvtodo_notifications',
  FCM_TOKEN: 'lvtodo_fcm_token',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  CREATE_TASK: '/tasks/create',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:id',
  CREATE_GROUP: '/groups/create',
  JOIN_GROUP: '/groups/join',
  WISHES: '/wishes',
  WISH_DETAIL: '/wishes/:id',
  CREATE_WISH: '/wishes/create',
  ACHIEVEMENTS: '/achievements',
  PROFILE: '/profile',
  STATS: '/stats',
  SETTINGS: '/settings',
};
