import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900/10 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">LVTodo</h1>
          <p className="text-dark-400">Gamified Tasks for Teams</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
