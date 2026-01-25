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
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Group } from '@/types';

/**
 * Generate random invite code
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a new group
 */
export const createGroup = async (
  name: string,
  createdBy: string,
  description?: string
): Promise<string> => {
  const inviteCode = generateInviteCode();

  const group = {
    name,
    description: description || '',
    inviteCode,
    memberIds: [createdBy],
    createdBy,
    createdAt: serverTimestamp(),
    settings: {
      allowWishes: true,
      requireTaskConfirmation: true,
    },
  };

  const docRef = await addDoc(collection(db, 'groups'), group);

  // Add group to user's groupIds
  await updateDoc(doc(db, 'users', createdBy), {
    groupIds: arrayUnion(docRef.id),
  });

  return docRef.id;
};

/**
 * Get group by ID
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  const docRef = doc(db, 'groups', groupId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Group;
  }

  return null;
};

/**
 * Get group by invite code
 */
export const getGroupByInviteCode = async (
  inviteCode: string
): Promise<Group | null> => {
  const q = query(
    collection(db, 'groups'),
    where('inviteCode', '==', inviteCode.toUpperCase())
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Group;
};

/**
 * Get user's groups
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const q = query(
    collection(db, 'groups'),
    where('memberIds', 'array-contains', userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Group)
  );
};

/**
 * Join group with invite code
 */
export const joinGroup = async (
  userId: string,
  inviteCode: string
): Promise<string> => {
  const group = await getGroupByInviteCode(inviteCode);

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.memberIds.includes(userId)) {
    throw new Error('Already a member of this group');
  }

  // Add user to group
  await updateDoc(doc(db, 'groups', group.id), {
    memberIds: arrayUnion(userId),
  });

  // Add group to user
  await updateDoc(doc(db, 'users', userId), {
    groupIds: arrayUnion(group.id),
  });

  return group.id;
};

/**
 * Leave group
 */
export const leaveGroup = async (
  userId: string,
  groupId: string
): Promise<void> => {
  // Remove user from group
  await updateDoc(doc(db, 'groups', groupId), {
    memberIds: arrayRemove(userId),
  });

  // Remove group from user
  await updateDoc(doc(db, 'users', userId), {
    groupIds: arrayRemove(groupId),
  });
};

/**
 * Update group settings
 */
export const updateGroupSettings = async (
  groupId: string,
  settings: Partial<Group['settings']>
): Promise<void> => {
  await updateDoc(doc(db, 'groups', groupId), {
    settings,
  });
};

/**
 * Delete group (only creator can delete)
 */
export const deleteGroup = async (
  groupId: string,
  userId: string
): Promise<void> => {
  const group = await getGroup(groupId);

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.createdBy !== userId) {
    throw new Error('Only the creator can delete the group');
  }

  // Remove group from all members
  for (const memberId of group.memberIds) {
    await updateDoc(doc(db, 'users', memberId), {
      groupIds: arrayRemove(groupId),
    });
  }

  // Delete group
  await deleteDoc(doc(db, 'groups', groupId));
};
