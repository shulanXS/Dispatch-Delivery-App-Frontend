import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Zap,
  Plus,
  Clock,
} from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useOrderStore } from "../../store/useOrderStore";
import CartItem from "../../components/CartItem";
import ConfirmModal from "../../components/ConfirmModal";
import { products as allProducts } from "../../mock/products";
import { categories } from "../../mock/categories";

const FREE_DELIVERY_THRESHOLD = 30;

export default function CartPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalCount = useCartStore((state) => state.getTotalCount);
  const toggleSelectAll = useCartStore((state) => state.toggleSelectAll);
  const clearCart = useCartStore((state) => state.clearCart);
  const addToCart = useCartStore((state) => state.addToCart);
  const cleanupZeroItems = useCartStore((state) => state.cleanupZeroItems);
  const orders = useOrderStore((state) => state.orders);

  // 离开购物车页面时，自动清理数量为 0 的商品
  useEffect(() => {
    return () => {
      cleanupZeroItems();
    };
  }, []);

  const activeItems = items.filter((i) => i.quantity > 0);
  const selectedItems = items.filter((i) => i.selected && i.quantity > 0);
  const allSelected =
    activeItems.length > 0 && activeItems.every((i) => i.selected);
  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  // 分类标签：提取购物车中实际存在的活跃商品分类
  const cartCategories = useMemo(() => {
    const cats = new Set(activeItems.map((i) => i.category).filter(Boolean));
    return categories.filter((c) => cats.has(c.id));
  }, [activeItems]);

  // 按分类筛选
  const filteredItems = activeTab
    ? items.filter((i) => i.category === activeTab)
    : items;

  // 常购推荐：从历史订单中提取买过但本次未购的商品
  const historyRecommendItems = useMemo(() => {
    if (orders.length === 0 || totalPrice >= FREE_DELIVERY_THRESHOLD) return [];
    const cartIds = new Set(activeItems.map((i) => i.productId));
    const historyIds = new Set(
      orders.flatMap((o) => o.items?.map((i) => i.productId) || []),
    );
    // 买过但不在购物车的
    const candidateIds = [...historyIds].filter((id) => !cartIds.has(id));
    return allProducts.filter((p) => candidateIds.includes(p.id)).slice(0, 2);
  }, [orders, activeItems, totalPrice]);

  // 凑单推荐：排除历史推荐的商品
  const recommendItems = useMemo(() => {
    if (totalPrice >= FREE_DELIVERY_THRESHOLD) return [];
    const cartIds = new Set(activeItems.map((i) => i.productId));
    const historyIds = new Set(historyRecommendItems.map((p) => p.id));
    return allProducts
      .filter(
        (p) =>
          !cartIds.has(p.id) &&
          !historyIds.has(p.id) &&
          p.price <= FREE_DELIVERY_THRESHOLD - totalPrice + 5,
      )
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  }, [activeItems, totalPrice, historyRecommendItems]);

  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - totalPrice);

  return (
    <div className="max-w-md mx-auto">
      {/* 顶部 */}
      <div className="sticky top-[56px] bg-white z-10 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/category" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-gray-800">
            购物车
            {activeItems.length > 0 && (
              <span className="text-gray-500 font-normal text-sm ml-1">
                ({activeItems.length}件商品)
              </span>
            )}
          </h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
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
          {/* 分类 Tab */}
          {cartCategories.length > 0 && (
            <div className="px-4 py-2 bg-white flex gap-2 overflow-x-auto border-b border-gray-100">
              <button
                onClick={() => setActiveTab(null)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  !activeTab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                全部 ({activeItems.length})
              </button>
              {cartCategories.map((cat) => {
                const count = activeItems.filter(
                  (i) => i.category === cat.id,
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                      activeTab === cat.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {getCategoryEmoji(cat.id)} {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          )}

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
              {selectedItems.length} / {activeItems.length} 件商品
            </span>
          </div>

          {/* 商品列表 */}
          <div className="p-4 space-y-3">
            {filteredItems.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
            {filteredItems.length === 0 && items.length > 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                该分类下暂无商品
              </p>
            )}
          </div>

          {/* 常购推荐 */}
          {selectedItems.length > 0 && historyRecommendItems.length > 0 && (
            <div className="mx-4 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  常购好物
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {historyRecommendItems.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex-shrink-0 flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-blue-100 hover:border-blue-300 transition-colors"
                  >
                    <span className="text-lg">
                      {getCategoryEmoji(p.category)}
                    </span>
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-blue-600 font-bold">
                        ¥{p.price.toFixed(2)}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 凑单推荐 */}
          {selectedItems.length > 0 &&
            remainingForFree > 0 &&
            recommendItems.length > 0 && (
              <div className="mx-4 mb-28 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    再购 ¥{remainingForFree.toFixed(2)} 享免配送费
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {recommendItems.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="flex-shrink-0 flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-orange-100 hover:border-orange-300 transition-colors"
                    >
                      <span className="text-lg">
                        {getCategoryEmoji(p.category)}
                      </span>
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                          {p.name}
                        </p>
                        <p className="text-xs text-orange-600 font-bold">
                          ¥{p.price.toFixed(2)}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-orange-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* 底部结算 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">合计</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{totalPrice.toFixed(2)}
                </p>
              </div>
              {selectedItems.length > 0 ? (
                <Link
                  to="/checkout"
                  className="px-8 py-3 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  去结算 ({totalCount})
                </Link>
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

      {/* 清空确认弹窗 */}
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

function getCategoryEmoji(category) {
  const map = {
    vegetable: "🥬",
    fruit: "🍓",
    drinks: "🥤",
    snacks: "🍪",
    dairy: "🥛",
    meat: "🥩",
    seafood: "🦐",
    frozen: "🧊",
  };
  return map[category] || "📦";
}
