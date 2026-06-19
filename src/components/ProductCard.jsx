import { ShoppingCart, MapPin } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-4xl">{getCategoryEmoji(product.category)}</span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
        <div className="flex items-center text-gray-500 text-xs mt-1">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{product.unit}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-blue-600">¥{product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const emojis = {
    vegetable: '🥬',
    fruit: '🍓',
    drinks: '🥤',
    snacks: '🍪',
    dairy: '🥛',
    meat: '🥩',
    seafood: '🦐',
    frozen: '🧊',
  };
  return emojis[category] || '📦';
}
