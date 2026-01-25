import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { getUserData } from '@/services/authService';
import { ROUTES } from '@/config/constants';

// Layouts
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import HomePage from '@/pages/HomePage';
import TasksPage from '@/pages/tasks/TasksPage';
import TaskDetailPage from '@/pages/tasks/TaskDetailPage';
import CreateTaskPage from '@/pages/tasks/CreateTaskPage';
import GroupsPage from '@/pages/groups/GroupsPage';
import GroupDetailPage from '@/pages/groups/GroupDetailPage';
import CreateGroupPage from '@/pages/groups/CreateGroupPage';
import JoinGroupPage from '@/pages/groups/JoinGroupPage';
import WishesPage from '@/pages/wishes/WishesPage';
import CreateWishPage from '@/pages/wishes/CreateWishPage';
import AchievementsPage from '@/pages/AchievementsPage';
import ProfilePage from '@/pages/ProfilePage';
import StatsPage from '@/pages/StatsPage';

// Components
import LoadingScreen from '@/components/common/LoadingScreen';
import ProtectedRoute from '@/components/common/ProtectedRoute';

function App() {
  const { setFirebaseUser, setUser, setLoading, firebaseUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const userData = await getUserData(user.uid);
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setUser, setLoading]);

  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              firebaseUser ? <Navigate to={ROUTES.HOME} replace /> : <LoginPage />
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              firebaseUser ? <Navigate to={ROUTES.HOME} replace /> : <RegisterPage />
            }
          />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.TASKS} element={<TasksPage />} />
          <Route path={ROUTES.TASK_DETAIL} element={<TaskDetailPage />} />
          <Route path={ROUTES.CREATE_TASK} element={<CreateTaskPage />} />
          <Route path={ROUTES.GROUPS} element={<GroupsPage />} />
          <Route path={ROUTES.GROUP_DETAIL} element={<GroupDetailPage />} />
          <Route path={ROUTES.CREATE_GROUP} element={<CreateGroupPage />} />
          <Route path={ROUTES.JOIN_GROUP} element={<JoinGroupPage />} />
          <Route path={ROUTES.WISHES} element={<WishesPage />} />
          <Route path={ROUTES.CREATE_WISH} element={<CreateWishPage />} />
          <Route path={ROUTES.ACHIEVEMENTS} element={<AchievementsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.STATS} element={<StatsPage />} />
        </Route>

        {/* Redirect to home by default */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
