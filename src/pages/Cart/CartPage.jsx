import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import CartItem from '../../components/CartItem';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalCount = useCartStore((state) => state.getTotalCount);
  const toggleSelectAll = useCartStore((state) => state.toggleSelectAll);
  const clearCart = useCartStore((state) => state.clearCart);

  const selectedItems = items.filter((i) => i.selected);
  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  return (
    <div className="max-w-md mx-auto">
      {/* 顶部 */}
      <div className="sticky top-[56px] bg-white z-10 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/category" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-gray-800">购物车</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        )}
      </div>

      {/* 购物车内容 */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">购物车是空的</p>
          <Link
            to="/category"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full"
          >
            去选购
          </Link>
        </div>
      ) : (
        <>
          {/* 全选 */}
          <div className="px-4 py-3 bg-white mt-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600">全选</span>
            <span className="ml-auto text-sm text-gray-500">
              {selectedItems.length} 件商品
            </span>
          </div>

          {/* 商品列表 */}
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          {/* 底部结算 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">合计</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{totalPrice.toFixed(2)}
                </p>
              </div>
              <Link
                to="/checkout"
                className={`px-8 py-3 rounded-full font-medium transition-colors ${
                  selectedItems.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                去结算 ({totalCount})
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
