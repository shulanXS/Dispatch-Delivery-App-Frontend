import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function CartItem({ item }) {
  const { updateQuantity, toggleSelected, removeFromCart } = useCartStore();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  return (
    <div className="flex gap-3 p-4 bg-white rounded-lg shadow-sm">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => toggleSelected(item.productId)}
        className="w-5 h-5 mt-6 accent-blue-600 cursor-pointer"
      />
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-3xl">{getCategoryEmoji(item.image)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">¥{item.price.toFixed(2)}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.productId)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="font-bold text-blue-600">
          ¥{(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function getCategoryEmoji(image) {
  if (image?.includes('vegetable')) return '🥬';
  if (image?.includes('fruit')) return '🍓';
  if (image?.includes('drinks')) return '🥤';
  if (image?.includes('snacks')) return '🍪';
  return '📦';
}
