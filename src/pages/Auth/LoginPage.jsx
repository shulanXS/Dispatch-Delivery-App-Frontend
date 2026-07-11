import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.normalizedMessage || '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
          <Package className="w-8 h-8 text-white" strokeWidth={2.4} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">SkyDrop</h1>
        <p className="text-sm text-gray-500 mt-1">无人机 × 地面机器人，下单即送达</p>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-6">账号登录</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">邮箱</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alice.chen@example.com"
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">密码</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 text-red-600 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-md shadow-blue-100"
        >
          <LogIn className="w-4 h-4" />
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        还没有账号？{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          立即注册
        </Link>
      </div>

      <div className="mt-10 text-xs text-gray-400 leading-relaxed text-center">
        <p>测试账号：alice.chen@example.com / password123</p>
      </div>
    </div>
  );
}
