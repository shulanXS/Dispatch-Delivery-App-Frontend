import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Header() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">派送配送</span>
        </Link>
        <Link
          to="/cart"
          className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
