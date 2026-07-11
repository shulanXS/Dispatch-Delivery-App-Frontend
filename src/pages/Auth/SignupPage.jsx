import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        address: address.trim(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.normalizedMessage || '注册失败');
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
        <h1 className="text-2xl font-bold text-gray-800">创建账号</h1>
        <p className="text-sm text-gray-500 mt-1">加入 SkyDrop，把城市装进口袋</p>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-6">基本信息</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">姓名</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">邮箱</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">密码（至少 6 位）</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">默认配送地址</span>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="如:100 Valencia St, San Francisco, CA"
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
          <UserPlus className="w-4 h-4" />
          {submitting ? '注册中...' : '注册'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        已有账号？{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          直接登录
        </Link>
      </div>
    </div>
  );
}
