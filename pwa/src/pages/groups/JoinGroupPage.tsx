import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { joinGroup } from '@/services/groupService';
import { ROUTES } from '@/config/constants';

export default function JoinGroupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const groupId = await joinGroup(user.id, inviteCode);
      navigate(`${ROUTES.GROUPS}/${groupId}`);
    } catch (err: any) {
      setError(err.message || 'Не удалось присоединиться к группе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-dark-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">Присоединиться к группе</h1>
      </div>

      {/* Form */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary-400" />
          </div>
          <p className="text-dark-300">
            Введите код приглашения, полученный от создателя группы
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2 text-center">
              Код приглашения
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-4 text-white text-center text-2xl font-mono tracking-widest placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 uppercase"
              placeholder="ABC123"
            />
            <p className="text-dark-500 text-sm text-center mt-2">
              6 символов: буквы и цифры
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || inviteCode.length !== 6}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Присоединение...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Присоединиться</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
