import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Wish } from '@/types';

/**
 * Create a new wish (without cost - will be set by group approval)
 */
export const createWish = async (
  title: string,
  description: string,
  createdBy: string,
  groupId: string
): Promise<string> => {
  const wish = {
    title,
    description,
    cost: 0, // Will be set after approval
    createdBy,
    groupId,
    status: 'pending_approval',
    approvedBy: [],
    costVotes: [],
    createdAt: serverTimestamp(),
  };

  const wishRef = await addDoc(collection(db, 'wishes'), wish);
  return wishRef.id;
};

/**
 * Get a single wish by ID
 */
export const getWish = async (wishId: string): Promise<Wish | null> => {
  const docRef = doc(db, 'wishes', wishId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Wish;
  }

  return null;
};

/**
 * Get all wishes for a user (created by them)
 */
export const getUserWishes = async (userId: string): Promise<Wish[]> => {
  const q = query(
    collection(db, 'wishes'),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Wish));
};

/**
 * Get all wishes for a group
 */
export const getGroupWishes = async (groupId: string): Promise<Wish[]> => {
  const q = query(
    collection(db, 'wishes'),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Wish));
};

/**
 * Get wishes pending approval for a group (not created by current user)
 */
export const getPendingWishesForApproval = async (
  groupId: string,
  userId: string
): Promise<Wish[]> => {
  const q = query(
    collection(db, 'wishes'),
    where('groupId', '==', groupId),
    where('status', '==', 'pending_approval')
  );

  const snapshot = await getDocs(q);
  const wishes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Wish));

  // Filter out wishes created by current user and already approved by them
  return wishes.filter(
    (wish) => wish.createdBy !== userId && !wish.approvedBy.includes(userId)
  );
};

/**
 * Approve a wish and suggest a cost
 */
export const approveWish = async (
  wishId: string,
  userId: string,
  suggestedCost: number
): Promise<void> => {
  const wishRef = doc(db, 'wishes', wishId);

  // Add user to approvedBy and add their cost vote
  await updateDoc(wishRef, {
    approvedBy: arrayUnion(userId),
    costVotes: arrayUnion({ userId, suggestedCost }),
  });

  // Check if we have enough approvals to activate the wish
  const wishDoc = await getDoc(wishRef);
  if (wishDoc.exists()) {
    const wish = wishDoc.data() as Wish;

    // Need at least 2 approvals (excluding creator)
    if (wish.approvedBy.length >= 2) {
      // Calculate average cost from all votes
      const totalCost = wish.costVotes.reduce((sum, vote) => sum + vote.suggestedCost, 0);
      const avgCost = Math.round(totalCost / wish.costVotes.length);

      // Activate the wish
      await updateDoc(wishRef, {
        status: 'active',
        cost: avgCost,
        approvedAt: serverTimestamp(),
      });
    }
  }
};

/**
 * Complete a wish (user "purchases" it with their points)
 */
export const completeWish = async (
  wishId: string,
  userId: string,
  userPoints: number
): Promise<void> => {
  const wishRef = doc(db, 'wishes', wishId);
  const wishDoc = await getDoc(wishRef);

  if (!wishDoc.exists()) {
    throw new Error('Wish not found');
  }

  const wish = wishDoc.data() as Wish;

  if (wish.status !== 'active') {
    throw new Error('Wish is not active');
  }

  if (wish.createdBy !== userId) {
    throw new Error('Only the creator can complete this wish');
  }

  if (userPoints < wish.cost) {
    throw new Error('Not enough points');
  }

  // Mark wish as completed
  await updateDoc(wishRef, {
    status: 'completed',
    completedAt: serverTimestamp(),
  });

  // Deduct points from user
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    points: increment(-wish.cost),
  });
};

/**
 * Cancel a wish (only by creator, only if pending)
 */
export const cancelWish = async (wishId: string, userId: string): Promise<void> => {
  const wishRef = doc(db, 'wishes', wishId);
  const wishDoc = await getDoc(wishRef);

  if (!wishDoc.exists()) {
    throw new Error('Wish not found');
  }

  const wish = wishDoc.data() as Wish;

  if (wish.createdBy !== userId) {
    throw new Error('Only the creator can cancel this wish');
  }

  if (wish.status !== 'pending_approval') {
    throw new Error('Can only cancel pending wishes');
  }

  await updateDoc(wishRef, {
    status: 'cancelled',
  });
};
