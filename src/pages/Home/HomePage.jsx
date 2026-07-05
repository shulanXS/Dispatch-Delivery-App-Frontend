import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Zap,
  Plane,
  Truck,
  ChevronRight,
  Store,
  Sparkles,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useCartStore } from '../../store/useCartStore';
import LoadingState from '../../components/LoadingState';
import SafeImage from '../../components/SafeImage';
import { formatRelative } from '../../utils/datetime';
import { groupProductsByCategory } from '../../data/categoryKeywords';

const CATEGORY_EMOJI = {
  vegetable: '🥬',
  fruit: '🍓',
  drinks: '🥤',
  snacks: '🍪',
  dairy: '🥛',
  meat: '🥩',
  seafood: '🦐',
  frozen: '🧊',
};

export default function HomePage() {
  const navigate = useNavigate();
  const categories = useProductStore((s) => s.categories);
  const stations = useProductStore((s) => s.stations);
  const stationsLoading = useProductStore((s) => s.stationsLoading);
  const fetchStations = useProductStore((s) => s.fetchStations);
  const setSelectedStation = useProductStore((s) => s.setSelectedStation);

  const products = useProductStore((s) => s.products);
  const loadingProducts = useProductStore((s) => s.loading);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  const user = useAuthStore((s) => s.user);
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const myOrders = useOrderStore((s) => s.myOrders);
  const fetchOrdersByUser = useOrderStore((s) => s.fetchOrdersByUser);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    if (products.length === 0 && !loadingProducts) fetchProducts();
  }, [products.length, loadingProducts, fetchProducts]);

  useEffect(() => {
    if (user?.id) fetchOrdersByUser();
  }, [user?.id, fetchOrdersByUser]);

  const hotPicks = (products || [])
    .slice()
    .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    .slice(0, 4);

  // Per-category counts so the home grid shows "蔬菜 3 件" without forcing
  // a tap into the category page first.
  const categoryCounts = useMemo(() => {
    const groups = groupProductsByCategory(products || []);
    const counts = {};
    for (const cat of categories) {
      counts[cat.id] = (groups[cat.id] || []).length;
    }
    return counts;
  }, [products]);

  // Merge currentOrder (set immediately on checkout, persisted) with myOrders
  // so the active-order banner appears the instant a new order is created,
  // without waiting for the next /orders/search round-trip.
  const mergedOrders = useMemo(() => {
    const byNo = new Map();
    for (const o of myOrders || []) byNo.set(o.orderNo, o);
    if (currentOrder && (currentOrder.status ?? 0) < 2) {
      byNo.set(currentOrder.orderNo, currentOrder);
    }
    return Array.from(byNo.values());
  }, [myOrders, currentOrder]);

  const activeOrders = mergedOrders
    .filter((o) => (o.status ?? 0) < 2)
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

  const recentOrder =
    mergedOrders.length > 0
      ? mergedOrders
          .slice()
          .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          })[0]
      : null;
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 6
      ? '夜深了'
      : greetingHour < 11
        ? '早安'
        : greetingHour < 14
          ? '中午好'
          : greetingHour < 18
            ? '下午好'
            : '晚上好';

  return (
    <div className="max-w-md mx-auto pb-10">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white px-6 pt-10 pb-14">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -right-8 top-24 w-32 h-32 rounded-full bg-cyan-300/30 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>你的智能配送管家</span>
            <span className="ml-1 inline-flex items-center gap-1 text-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
              营业中
            </span>
          </div>

          <h1 className="text-[26px] font-bold leading-tight">
            {user ? `${greeting}，${user.name}` : '欢迎来到 SkyDrop'}
          </h1>
          <p className="mt-2.5 text-blue-50/95 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-cyan-200" />
            <span className="truncate">
              {user?.address || '登录后查看你的配送区域'}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-5">
            <Chip icon={Zap} label="极速" tone="bg-amber-300/20 text-amber-50 ring-1 ring-amber-200/40" />
            <Chip icon={Plane} label="空地双路" tone="bg-sky-300/20 text-sky-50 ring-1 ring-sky-200/40" />
            <Chip icon={Clock} label="15-25 分钟" tone="bg-emerald-300/20 text-emerald-50 ring-1 ring-emerald-200/40" />
          </div>

          {user && (
            <div className="mt-6 flex gap-2.5">
              <Link
                to="/category"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-blue-700 font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[0.99] transition-all text-sm"
              >
                <Search className="w-4 h-4" />
                立即选购
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-1.5 bg-white/15 backdrop-blur text-white font-medium py-2.5 px-4 rounded-xl ring-1 ring-white/20 hover:bg-white/25 transition-all text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                我的订单
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats card */}
      <div className="mx-4 -mt-7 bg-white rounded-2xl shadow-xl shadow-indigo-100/60 border border-gray-100 p-5 relative z-10">
        <div className="flex items-stretch divide-x divide-gray-100">
          <StatBlock value={String(stations.length || 0)} label="配送站" />
          <StatBlock value={String(products.length || 0)} label="在售商品" />
          <StatBlock
            value={String(activeOrders.length || myOrders.length || 0)}
            label={activeOrders.length ? '进行中' : '历史订单'}
          />
        </div>
      </div>

      {/* Active order teaser */}
      {activeOrders.length > 0 && (
        <Link
          to={`/logistics/${activeOrders[0].orderNo}`}
          className="mx-4 mt-4 block bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              {activeOrders[0].deliveryMode === 'ROBOT' ? (
                <Truck className="w-6 h-6 text-emerald-200" />
              ) : (
                <Plane className="w-6 h-6 text-cyan-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                {activeOrders[0].deliveryMode === 'ROBOT' ? '地面机器人' : '无人机'}配送中
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  LIVE
                </span>
              </p>
              <p className="text-xs text-blue-100 truncate mt-0.5">
                {activeOrders[0].orderNo} ·{' '}
                {activeOrders[0].deliveryMode === 'ROBOT' ? '25-40' : '15-25'} 分钟送达
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </Link>
      )}

      {/* Hubs */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800">身边的配送站</h2>
            <p className="text-xs text-gray-500 mt-0.5">3 个站覆盖整个旧金山</p>
          </div>
          <Link to="/category" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
            切换站点 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stationsLoading ? (
          <LoadingState label="加载站点中..." size="sm" className="py-6" />
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {stations.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStation(s.id);
                  navigate('/category');
                }}
                className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm bg-gradient-to-br ${
                    idx % 3 === 0
                      ? 'from-blue-500 to-indigo-600'
                      : idx % 3 === 1
                        ? 'from-emerald-500 to-teal-600'
                        : 'from-violet-500 to-purple-600'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 truncate text-sm">{s.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-emerald-100">
                      在线
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{s.address}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">商品分类</h2>
          <Link
            to="/category"
            className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
          >
            全部 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => {
            const count = categoryCounts[category.id] || 0;
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group relative flex flex-col items-center p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <span className="text-2xl mb-1 floaty">
                  {CATEGORY_EMOJI[category.id] || '🛒'}
                </span>
                <span className="text-xs text-gray-700 font-medium">{category.name}</span>
                {count > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium ring-1 ring-blue-100">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hot picks */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800">热门商品</h2>
            <p className="text-xs text-gray-500 mt-0.5">为你精选的当季好物</p>
          </div>
          <Link to="/category" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
            全部 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {!loadingProducts && hotPicks.length === 0 && (
          <p className="text-sm text-gray-500 py-8 text-center">暂无商品</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {hotPicks.map((p) => {
            const stock = Number.isFinite(p.stock) ? p.stock : null;
            const lowStock = stock !== null && stock > 0 && stock <= 5;
            const outOfStock = stock !== null && stock <= 0;
            return (
              <div
                key={p.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="relative">
                  <SafeImage
                    src={p.imageUrl}
                    alt={p.name}
                    fallback="🛍️"
                    className="w-full h-28 object-cover"
                  />
                  {outOfStock ? (
                    <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-gray-700/80 text-white rounded-full font-medium shadow-sm">
                      暂时缺货
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-orange-500 text-white rounded-full font-medium shadow-sm">
                      秒杀
                    </span>
                  )}
                  {lowStock && !outOfStock && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-rose-500 text-white rounded-full font-medium shadow-sm">
                      仅剩 {stock} 件
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="font-medium text-sm text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {(p.description || '现货速达').slice(0, 14)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`font-bold ${outOfStock ? 'text-gray-400' : 'text-blue-600'}`}>
                      ¥{Number(p.price).toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!outOfStock) addToCart(p);
                      }}
                      disabled={outOfStock}
                      className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                        outOfStock
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      aria-label={outOfStock ? '暂时缺货' : '加入购物车'}
                    >
                      {outOfStock ? '缺货' : '+ 加车'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent order (history) */}
      {user && recentOrder && (
        <div className="px-4">
          <Link
            to={`/order/${recentOrder.orderNo}`}
            className="block bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm text-gray-800">最近订单</p>
              <span className="text-xs text-blue-600 flex items-center gap-0.5">
                查看详情 <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  recentOrder.deliveryMode === 'ROBOT'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-sky-50 text-sky-600'
                }`}
              >
                {recentOrder.deliveryMode === 'ROBOT' ? (
                  <Truck className="w-5 h-5" />
                ) : (
                  <Plane className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {recentOrder.orderNo}
                </p>
                <p className="text-xs text-gray-500">
                  {formatRelative(recentOrder.createdAt) || '刚刚'}
                </p>
              </div>
              <p className="font-bold text-blue-600">
                ¥{Number(recentOrder.totalAmount || 0).toFixed(2)}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

function Chip({ icon: Icon, label, tone }) {
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1 backdrop-blur ${tone}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="flex-1 text-center px-2">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
