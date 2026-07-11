import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, User, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + (i.quantity > 0 ? i.quantity : 0), 0),
  );
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">SkyDrop</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-1">
            <Link
              to="/cart"
              title="购物车"
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/orders"
              title="我的订单"
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>
            <Link
              to="/profile"
              title="个人中心"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 px-2"
            >
              <User className="w-4 h-4" />
              <span className="truncate max-w-[80px]">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:underline"
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}