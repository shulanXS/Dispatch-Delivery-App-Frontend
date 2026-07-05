import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import CartItem from '../../components/CartItem';
import ConfirmModal from '../../components/ConfirmModal';
import { useProductStore } from '../../store/useProductStore';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function CartPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalCount = useCartStore((state) => state.getTotalCount);
  const toggleSelectAll = useCartStore((state) => state.toggleSelectAll);
  const clearCart = useCartStore((state) => state.clearCart);
  const addToCart = useCartStore((state) => state.addToCart);
  const cleanupZeroItems = useCartStore((state) => state.cleanupZeroItems);
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const navigate = useNavigate();

  // Leave cart: drop any zero-quantity rows.
  useEffect(() => {
    return () => {
      cleanupZeroItems();
    };
  }, []);

  // Make sure products are loaded so we can recommend local items.
  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, [products.length, fetchProducts]);

  const activeItems = items.filter((i) => i.quantity > 0);
  const selectedItems = items.filter((i) => i.selected && i.quantity > 0);
  const allSelected =
    activeItems.length > 0 && activeItems.every((i) => i.selected);
  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  // Recommendations derived from currently selected items only.
  const recommendItems = (() => {
    if (activeItems.length === 0) return [];
    const cartIds = new Set(activeItems.map((i) => i.productId));
    return products
      .filter((p) => !cartIds.has(p.id) && p.price <= 30)
      .slice(0, 6);
  })();

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title={
          <>
            购物车
            {activeItems.length > 0 && (
              <span className="text-gray-500 font-normal text-sm ml-1">
                ({activeItems.length}件商品)
              </span>
            )}
          </>
        }
        back
        backTo="/category"
        right={
          items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-red-500 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          )
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="购物车是空的"
          description="去浏览分类，给自己加一份好货吧～"
          action={
            <Link
              to="/category"
              className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              去选购
            </Link>
          }
        />
      ) : (
        <>
          <div className="px-4 py-3 bg-white mt-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600">全选</span>
            <span className="ml-auto text-sm text-gray-500">
              {selectedItems.length} / {activeItems.length} 件商品
            </span>
          </div>

          <div className="p-4 space-y-3">
            {activeItems.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          {selectedItems.length > 0 && recommendItems.length > 0 && (
            <div className="mx-4 mb-28 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  你可能还想买
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {recommendItems.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex-shrink-0 flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-orange-100 hover:border-orange-300 transition-colors"
                  >
                    <span className="text-lg">📦</span>
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-orange-600 font-bold">
                        ¥{Number(p.price).toFixed(2)}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-orange-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">合计</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{totalPrice.toFixed(2)}
                </p>
              </div>
              {selectedItems.length > 0 ? (
                <button
                  onClick={handleCheckout}
                  className="px-8 py-3 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  去结算 ({totalCount})
                </button>
              ) : (
                <button
                  disabled
                  className="px-8 py-3 rounded-full font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  去结算 ({totalCount})
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={showClearConfirm}
        title="清空购物车"
        message="确定要清空购物车中所有商品吗？此操作不可恢复。"
        onConfirm={() => {
          clearCart();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
