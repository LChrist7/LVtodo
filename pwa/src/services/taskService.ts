import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Task } from '@/types';
import { calculateTaskPoints, calculateTaskXP } from '@/utils/gameLogic';

/**
 * Create a new task
 */
export const createTask = async (
  taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'notificationsSent'>
): Promise<string> => {
  const task = {
    ...taskData,
    status: 'pending',
    createdAt: serverTimestamp(),
    notificationsSent: {
      percent80: false,
      percent50: false,
      percent30: false,
      percent5: false,
    },
  };

  const docRef = await addDoc(collection(db, 'tasks'), task);
  return docRef.id;
};

/**
 * Get task by ID
 */
export const getTask = async (taskId: string): Promise<Task | null> => {
  const docRef = doc(db, 'tasks', taskId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Task;
  }

  return null;
};

/**
 * Get tasks assigned TO a user (where user is executor)
 */
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, 'tasks'),
    where('assignedTo', '==', userId),
    orderBy('deadline', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Task)
  );
};

/**
 * Get tasks assigned BY a user (where user is creator)
 */
export const getCreatedTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, 'tasks'),
    where('assignedBy', '==', userId),
    orderBy('deadline', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Task)
  );
};

/**
 * Get tasks for a group
 */
export const getGroupTasks = async (groupId: string): Promise<Task[]> => {
  const q = query(
    collection(db, 'tasks'),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Task)
  );
};

/**
 * Update task status
 */
export const updateTaskStatus = async (
  taskId: string,
  status: Task['status'],
  userId?: string
): Promise<void> => {
  const updates: Partial<Task> = { status };

  if (status === 'completed') {
    updates.completedAt = serverTimestamp() as Timestamp;
  } else if (status === 'confirmed' && userId) {
    updates.confirmedAt = serverTimestamp() as Timestamp;
    updates.confirmedBy = userId;
  }

  await updateDoc(doc(db, 'tasks', taskId), updates);
};

/**
 * Update task notification sent status
 */
export const updateTaskNotification = async (
  taskId: string,
  notificationType: keyof Task['notificationsSent']
): Promise<void> => {
  await updateDoc(doc(db, 'tasks', taskId), {
    [`notificationsSent.${notificationType}`]: true,
  });
};

/**
 * Delete task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await deleteDoc(doc(db, 'tasks', taskId));
};

/**
 * Complete task (by assignee) - does NOT award points yet
 */
export const completeTask = async (
  taskId: string,
  isLate: boolean
): Promise<void> => {
  await updateTaskStatus(taskId, isLate ? 'late' : 'completed');
};

/**
 * Confirm task completion (by assigner) and award points/XP
 */
export const confirmTask = async (
  taskId: string,
  userId: string
): Promise<{ points: number; xp: number }> => {
  const task = await getTask(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Calculate rewards
  const isLate = task.status === 'late';
  const points = calculateTaskPoints(task.difficulty, isLate);
  const xp = calculateTaskXP(task.difficulty);

  // Update task status to confirmed
  await updateTaskStatus(taskId, 'confirmed', userId);

  // Update user stats
  const userRef = doc(db, 'users', task.assignedTo);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    await updateDoc(userRef, {
      points: (userData.points || 0) + points,
      xp: (userData.xp || 0) + xp,
    });
  }

  // Create history entry
  await addDoc(collection(db, 'taskHistory'), {
    taskId,
    userId: task.assignedTo,
    groupId: task.groupId,
    action: 'confirmed',
    timestamp: serverTimestamp(),
    metadata: { points, xp },
  });

  return { points, xp };
};

/**
 * Dispute task completion (by assigner) - return to pending
 */
export const disputeTask = async (taskId: string): Promise<void> => {
  await updateTaskStatus(taskId, 'pending');
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<{
  totalTasksCompleted: number;
  totalTasksLate: number;
  totalTasksConfirmed: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}> => {
  // Get all tasks for this user
  const allTasks = await getUserTasks(userId);

  const totalTasksCompleted = allTasks.filter(t => t.status === 'completed' || t.status === 'confirmed').length;
  const totalTasksLate = allTasks.filter(t => t.status === 'late').length;
  const totalTasksConfirmed = allTasks.filter(t => t.status === 'confirmed').length;

  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalTasksConfirmed / totalTasks) * 100) : 0;

  // Calculate streaks from task history
  const historyQuery = query(
    collection(db, 'taskHistory'),
    where('userId', '==', userId),
    where('action', '==', 'confirmed'),
    orderBy('timestamp', 'desc')
  );

  const historySnapshot = await getDocs(historyQuery);
  const completedDates = historySnapshot.docs.map(doc => {
    const data = doc.data();
    return data.timestamp?.toDate() || new Date();
  });

  // Calculate current and longest streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDates = [...new Set(completedDates.map(d => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }))].sort((a, b) => b - a);

  // Calculate current streak
  let lastDate = today.getTime();
  for (const dateTime of uniqueDates) {
    const diff = Math.floor((lastDate - dateTime) / (1000 * 60 * 60 * 24));
    if (diff <= 1) {
      currentStreak++;
      lastDate = dateTime;
    } else {
      break;
    }
  }

  // Calculate longest streak
  if (uniqueDates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }

  return {
    totalTasksCompleted,
    totalTasksLate,
    totalTasksConfirmed,
    currentStreak,
    longestStreak,
    completionRate,
  };
};
