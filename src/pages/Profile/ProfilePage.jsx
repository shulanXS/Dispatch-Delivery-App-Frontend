import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import * as usersApi from '../../api/users';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [email, setEmail] = useState(user?.email || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pull authoritative profile from the backend on mount.
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (!user?.id) return;
      setRefreshing(true);
      try {
        const fresh = await usersApi.getUser(user.id);
        if (cancelled) return;
        setUser(fresh);
        setName(fresh.name || '');
        setAddress(fresh.address || '');
        setEmail(fresh.email || '');
      } catch (_) {
        // silently keep cached values on transient failure
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }
    refresh();
    return () => {
      cancelled = true;
    };
  }, [user?.id, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await usersApi.updateUser(user.id, {
        name: name.trim(),
        address: address.trim(),
        email: email.trim(),
      });
      setUser(updated);
      setSuccess('已保存');
    } catch (err) {
      setError(err.normalizedMessage || err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="sticky top-[var(--header-h)] bg-white/95 backdrop-blur z-10 px-4 py-3 shadow-sm flex items-center gap-3">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-gray-800">个人中心</h1>
        {refreshing && (
          <Loader2 className="w-4 h-4 ml-auto animate-spin text-gray-400" />
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block bg-white rounded-xl shadow-sm p-4">
            <span className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              姓名
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </label>

          <label className="block bg-white rounded-xl shadow-sm p-4">
            <span className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              配送地址
            </span>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </label>

          <label className="block bg-white rounded-xl shadow-sm p-4 opacity-70">
            <span className="text-sm text-gray-600 mb-2 block">邮箱(只读)</span>
            <input
              type="email"
              disabled
              value={email}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50"
            />
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-600 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}