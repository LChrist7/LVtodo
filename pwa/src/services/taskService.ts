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
 * Get tasks for a user
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
 * Complete task and award points/XP
 */
export const completeTask = async (
  taskId: string,
  userId: string,
  isLate: boolean
): Promise<{ points: number; xp: number }> => {
  const task = await getTask(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  const points = calculateTaskPoints(task.difficulty, isLate);
  const xp = calculateTaskXP(task.difficulty);

  // Update task status
  await updateTaskStatus(taskId, isLate ? 'late' : 'completed');

  // Update user stats
  const userRef = doc(db, 'users', userId);
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
    userId,
    groupId: task.groupId,
    action: isLate ? 'late' : 'completed',
    timestamp: serverTimestamp(),
    metadata: { points, xp },
  });

  return { points, xp };
};
