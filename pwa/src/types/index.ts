import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: number;
  xp: number;
  points: number;
  groupIds: string[];
  achievementIds: string[];
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  memberIds: string[];
  createdBy: string;
  createdAt: Timestamp;
  settings: {
    allowWishes: boolean;
    requireTaskConfirmation: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'hard';
  points: number;
  xp: number;
  assignedTo: string;
  assignedBy: string;
  groupId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'confirmed' | 'late';
  deadline: Timestamp;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  confirmedAt?: Timestamp;
  confirmedBy?: string;
  notificationsSent: {
    percent80: boolean;
    percent50: boolean;
    percent30: boolean;
    percent5: boolean;
  };
}

export interface Wish {
  id: string;
  title: string;
  description?: string;
  cost: number;
  imageURL?: string;
  createdBy: string;
  groupId: string;
  status: 'available' | 'purchased' | 'fulfilled';
  createdAt: Timestamp;
  purchasedAt?: Timestamp;
  purchasedBy?: string;
  fulfilledAt?: Timestamp;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: 'tasks_completed' | 'level_reached' | 'points_earned' | 'streak_days' | 'wishes_purchased';
    value: number;
  };
  reward: {
    xp?: number;
    points?: number;
  };
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  groupId: string;
  action: 'created' | 'started' | 'completed' | 'confirmed' | 'late';
  timestamp: Timestamp;
  metadata?: {
    points?: number;
    xp?: number;
    penalty?: number;
  };
}

export interface UserStats {
  userId: string;
  totalTasksCompleted: number;
  totalTasksLate: number;
  totalPoints: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastTaskDate?: Timestamp;
  achievementCount: number;
  wishesPurchased: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    type: 'task' | 'achievement' | 'wish' | 'group';
    id: string;
    url?: string;
  };
}
