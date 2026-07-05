import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const MAX_QUANTITY = 99;

export default function CartItem({ item }) {
  const { updateQuantity, toggleSelected } = useCartStore();
  const isRemoved = item.quantity === 0;

  const handleDecrease = () => {
    if (item.quantity > 0) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < MAX_QUANTITY) {
      updateQuantity(item.productId, item.quantity + 1);
    }
  };

  const handleRestore = () => {
    updateQuantity(item.productId, 1);
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg shadow-sm transition-all duration-300 ${
        isRemoved ? 'bg-gray-50 opacity-60' : 'bg-white'
      }`}
    >
      <input
        type="checkbox"
        checked={item.selected && !isRemoved}
        disabled={isRemoved}
        onChange={() => toggleSelected(item.productId)}
        className="w-5 h-5 mt-6 accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      />
      <div
        className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
          isRemoved ? 'bg-gray-200' : 'bg-gray-50'
        }`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className={`w-full h-full object-cover ${
              isRemoved ? 'grayscale' : ''
            }`}
          />
        ) : (
          <span className="text-3xl">📦</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium truncate ${
            isRemoved ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          {item.name}
        </h3>
        <p
          className={`text-sm mt-0.5 ${
            isRemoved ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          ¥{item.price.toFixed(2)}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 0}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            {isRemoved ? (
              <span className="w-8 text-center text-sm text-gray-400">0</span>
            ) : (
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
            )}
            {isRemoved ? (
              <button
                onClick={handleRestore}
                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                title="恢复商品"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleIncrease}
                disabled={item.quantity >= MAX_QUANTITY}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          {isRemoved && <span className="text-xs text-gray-400">已移除</span>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span
          className={`font-bold ${
            isRemoved ? 'text-gray-300' : 'text-blue-600'
          }`}
        >
          ¥{(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
