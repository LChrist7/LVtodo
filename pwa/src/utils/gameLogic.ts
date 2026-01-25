import { GAME_CONSTANTS } from '@/config/constants';

/**
 * Calculate level from XP
 */
export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / GAME_CONSTANTS.XP_PER_LEVEL) + 1;
};

/**
 * Calculate XP needed for next level
 */
export const xpForNextLevel = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  return currentLevel * GAME_CONSTANTS.XP_PER_LEVEL;
};

/**
 * Calculate XP progress percentage for current level
 */
export const xpProgress = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  const xpInCurrentLevel = currentXP - ((currentLevel - 1) * GAME_CONSTANTS.XP_PER_LEVEL);
  return (xpInCurrentLevel / GAME_CONSTANTS.XP_PER_LEVEL) * 100;
};

/**
 * Calculate points for task based on difficulty and completion status
 */
export const calculateTaskPoints = (
  difficulty: 'easy' | 'hard',
  isLate: boolean
): number => {
  const basePoints =
    difficulty === 'easy'
      ? GAME_CONSTANTS.EASY_TASK_POINTS
      : GAME_CONSTANTS.HARD_TASK_POINTS;

  if (isLate) {
    return Math.floor(basePoints * GAME_CONSTANTS.LATE_PENALTY_MULTIPLIER);
  }

  return basePoints;
};

/**
 * Calculate XP for task based on difficulty
 */
export const calculateTaskXP = (difficulty: 'easy' | 'hard'): number => {
  return difficulty === 'easy'
    ? GAME_CONSTANTS.EASY_TASK_XP
    : GAME_CONSTANTS.HARD_TASK_XP;
};

/**
 * Check if task is late
 */
export const isTaskLate = (deadline: Date): boolean => {
  return new Date() > deadline;
};

/**
 * Calculate time remaining percentage
 */
export const timeRemainingPercent = (createdAt: Date, deadline: Date): number => {
  const now = new Date();
  const total = deadline.getTime() - createdAt.getTime();
  const remaining = deadline.getTime() - now.getTime();

  if (remaining <= 0) return 0;
  if (remaining >= total) return 100;

  return (remaining / total) * 100;
};

/**
 * Get level color based on level number
 */
export const getLevelColor = (level: number): string => {
  if (level < 10) return '#94A3B8'; // gray
  if (level < 20) return '#10B981'; // green
  if (level < 30) return '#3B82F6'; // blue
  if (level < 40) return '#8B5CF6'; // purple
  if (level < 50) return '#F59E0B'; // amber
  return '#EF4444'; // red
};

/**
 * Get level title based on level number
 */
export const getLevelTitle = (level: number): string => {
  if (level < 5) return 'Новичок';
  if (level < 10) return 'Ученик';
  if (level < 20) return 'Опытный';
  if (level < 30) return 'Профессионал';
  if (level < 40) return 'Эксперт';
  if (level < 50) return 'Мастер';
  if (level < 75) return 'Легенда';
  return 'Бог задач';
};

/**
 * Format time remaining as human-readable string
 */
export const formatTimeRemaining = (deadline: Date): string => {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) return 'Просрочено';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м`;
};
