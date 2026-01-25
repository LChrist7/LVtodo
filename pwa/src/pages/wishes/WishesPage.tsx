import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Gift, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getUserWishes, completeWish, getPendingWishesForApproval, approveWish } from '@/services/wishService';
import { ROUTES } from '@/config/constants';
import { Wish } from '@/types';

export default function WishesPage() {
  const user = useAuthStore((state) => state.user);
  const [myWishes, setMyWishes] = useState<Wish[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingWishId, setCompletingWishId] = useState<string | null>(null);
  const [approvingWishId, setApprovingWishId] = useState<string | null>(null);
  const [suggestedCost, setSuggestedCost] = useState<{ [wishId: string]: number }>({});

  useEffect(() => {
    const loadWishes = async () => {
      if (!user) return;

      try {
        setError(null);
        const [wishes, pending] = await Promise.all([
          getUserWishes(user.id),
          // Get pending wishes from all user's groups
          user.groupIds.length > 0
            ? Promise.all(
                user.groupIds.map((groupId) =>
                  getPendingWishesForApproval(groupId, user.id)
                )
              ).then((results) => results.flat())
            : Promise.resolve([]),
        ]);

        setMyWishes(wishes);
        setPendingApprovals(pending);
      } catch (error) {
        console.error('Failed to load wishes:', error);
        setError('Не удалось загрузить желания. Проверьте подключение к интернету.');
      } finally {
        setLoading(false);
      }
    };

    loadWishes();
  }, [user]);

  const handleCompleteWish = async (wishId: string) => {
    if (!user) return;

    setCompletingWishId(wishId);
    try {
      await completeWish(wishId, user.id, user.points);
      // Reload wishes
      const updatedWishes = await getUserWishes(user.id);
      setMyWishes(updatedWishes);
    } catch (error: any) {
      alert(error.message || 'Ошибка при выполнении желания');
    } finally {
      setCompletingWishId(null);
    }
  };

  const handleApproveWish = async (wishId: string) => {
    if (!user) return;

    const cost = suggestedCost[wishId];
    if (!cost || cost <= 0) {
      alert('Укажите стоимость');
      return;
    }

    setApprovingWishId(wishId);
    try {
      await approveWish(wishId, user.id, cost);
      // Remove from pending list
      setPendingApprovals((prev) => prev.filter((w) => w.id !== wishId));
      alert('Желание одобрено! После 2+ одобрений оно станет активным.');
    } catch (error: any) {
      alert(error.message || 'Ошибка при одобрении');
    } finally {
      setApprovingWishId(null);
    }
  };

  const getStatusBadge = (wish: Wish) => {
    switch (wish.status) {
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-lg">
            <Clock className="w-3 h-3" />
            Ожидает одобрения
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg">
            <CheckCircle className="w-3 h-3" />
            Активно
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-lg">
            <CheckCircle className="w-3 h-3" />
            Выполнено
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-lg">
            <XCircle className="w-3 h-3" />
            Отменено
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Ожидают одобрения</h2>
          <div className="space-y-3">
            {pendingApprovals.map((wish) => (
              <div
                key={wish.id}
                className="bg-dark-800 border border-yellow-600/30 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold text-lg">{wish.title}</h3>
                  {getStatusBadge(wish)}
                </div>
                <p className="text-dark-300 mb-4">{wish.description}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Предложить стоимость"
                    value={suggestedCost[wish.id] || ''}
                    onChange={(e) =>
                      setSuggestedCost({
                        ...suggestedCost,
                        [wish.id]: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={() => handleApproveWish(wish.id)}
                    disabled={approvingWishId === wish.id}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {approvingWishId === wish.id ? 'Одобрение...' : 'Одобрить'}
                  </button>
                </div>
                <p className="text-dark-500 text-xs mt-2">
                  Одобрено: {wish.approvedBy.length} / 2+
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Wishes */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Мои желания</h2>
        {myWishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myWishes.map((wish) => (
              <div
                key={wish.id}
                className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold">{wish.title}</h3>
                  {getStatusBadge(wish)}
                </div>
                <p className="text-dark-300 text-sm mb-4 line-clamp-2">{wish.description}</p>

                {wish.cost > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-dark-400 text-sm">Стоимость:</span>
                    <span className="text-amber-400 font-bold text-lg">{wish.cost} 💰</span>
                  </div>
                )}

                {wish.status === 'active' && (
                  <button
                    onClick={() => handleCompleteWish(wish.id)}
                    disabled={
                      completingWishId === wish.id || (user?.points || 0) < wish.cost
                    }
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    {completingWishId === wish.id
                      ? 'Выполнение...'
                      : (user?.points || 0) < wish.cost
                      ? 'Недостаточно баллов'
                      : 'Выполнить желание'}
                  </button>
                )}

                {wish.status === 'pending_approval' && (
                  <p className="text-dark-500 text-xs">
                    Ожидает одобрения группы ({wish.approvedBy.length}/2+)
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
