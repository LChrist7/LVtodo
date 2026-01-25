import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';

/**
 * Register new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    email: user.email!,
    displayName,
    level: 1,
    xp: 0,
    points: 0,
    groupIds: [],
    achievementIds: [],
    createdAt: serverTimestamp() as any,
    lastLogin: serverTimestamp() as any,
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return user;
};

/**
 * Login user with email and password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Update last login
  await setDoc(
    doc(db, 'users', userCredential.user.uid),
    { lastLogin: serverTimestamp() },
    { merge: true }
  );

  return userCredential.user;
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }

  return null;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Update user password
 */
export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user');
  }

  // Re-authenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await firebaseUpdatePassword(user, newPassword);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  updates: Partial<Pick<User, 'displayName' | 'photoURL'>>
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  // Update Firebase Auth profile
  if (updates.displayName || updates.photoURL) {
    await updateProfile(user, {
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });
  }

  // Update Firestore document
  await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
};
