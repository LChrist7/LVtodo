import { NavLink } from 'react-router-dom';
import { Home, ListTodo, Users, Gift, Trophy } from 'lucide-react';
import { ROUTES } from '@/config/constants';
import clsx from 'clsx';

const navItems = [
  { icon: Home, label: 'Главная', path: ROUTES.HOME },
  { icon: ListTodo, label: 'Задачи', path: ROUTES.TASKS },
  { icon: Users, label: 'Группы', path: ROUTES.GROUPS },
  { icon: Gift, label: 'Желания', path: ROUTES.WISHES },
  { icon: Trophy, label: 'Награды', path: ROUTES.ACHIEVEMENTS },
];

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'text-primary-400'
                    : 'text-dark-400 hover:text-dark-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx('w-6 h-6', isActive && 'drop-shadow-glow')} />
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
