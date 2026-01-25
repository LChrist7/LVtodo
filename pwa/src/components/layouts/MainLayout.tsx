import { Outlet } from 'react-router-dom';
import Navigation from '@/components/navigation/Navigation';
import Header from '@/components/navigation/Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main className="pb-20 pt-16">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}
