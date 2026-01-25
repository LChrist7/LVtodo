import { Link } from 'react-router-dom';
import { Plus, Gift } from 'lucide-react';
import { ROUTES } from '@/config/constants';

export default function WishesPage() {
  // Placeholder for wishes functionality
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Желания</h1>
        <Link
          to={ROUTES.CREATE_WISH}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Создать</span>
        </Link>
      </div>

      {/* Empty State */}
      <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
        <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-dark-500" />
        </div>
        <p className="text-dark-400 mb-6">Создайте список желаний и тратьте баллы!</p>
        <Link
          to={ROUTES.CREATE_WISH}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить желание</span>
        </Link>
      </div>
    </div>
  );
}
