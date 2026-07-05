import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import SafeImage from './SafeImage';

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const stock = Number.isFinite(product?.stock) ? product.stock : null;
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock > 0 && stock <= 5;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md border border-gray-100 hover:border-blue-200 transition-all">
      <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden relative">
        <SafeImage
          src={product.imageUrl}
          alt={product.name}
          fallback="📦"
          className="w-full h-full object-cover"
        />
        {lowStock && (
          <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-orange-500 text-white rounded-full font-medium shadow-sm">
            仅剩 {stock} 件
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-gray-700/80 text-white rounded-full font-medium shadow-sm">
            暂时缺货
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {product.description || '现货速达'}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-lg font-bold ${outOfStock ? 'text-gray-400' : 'text-blue-600'}`}>
            ¥{Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`p-2 rounded-full transition-colors shadow-sm ${
              outOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
            }`}
            aria-label={outOfStock ? '暂时缺货' : '加入购物车'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
