import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  RefreshCw,
  Loader2,
  Store,
  Package,
} from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { categories } from '../../mock/categories';
import { inferCategory } from '../../data/categoryKeywords';
import ProductCard from '../../components/ProductCard';

export default function CategoryPage() {
  const { id } = useParams();

  const stations = useProductStore((s) => s.stations);
  const stationsLoading = useProductStore((s) => s.stationsLoading);
  const fetchStations = useProductStore((s) => s.fetchStations);

  const stationProducts = useProductStore((s) => s.stationProducts);
  const stationProductsLoading = useProductStore((s) => s.stationProductsLoading);
  const stationProductsError = useProductStore((s) => s.stationProductsError);
  const selectedStationId = useProductStore((s) => s.selectedStationId);
  const setSelectedStation = useProductStore((s) => s.setSelectedStation);
  const fetchProductsForStation = useProductStore(
    (s) => s.fetchProductsForStation,
  );

  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (stations.length === 0 && !stationsLoading) fetchStations();
  }, [stations.length, stationsLoading, fetchStations]);

  useEffect(() => {
    if (!selectedStationId && stations.length > 0) {
      setSelectedStation(stations[0].id);
    }
  }, [selectedStationId, stations, setSelectedStation]);

  useEffect(() => {
    if (selectedStationId) fetchProductsForStation(selectedStationId);
  }, [selectedStationId, fetchProductsForStation]);

  // Soft-categorize the per-station catalog for display.
  const filteredProducts = useMemo(() => {
    if (!id || id === 'all') return stationProducts;
    return stationProducts.filter((p) => inferCategory(p) === id);
  }, [id, stationProducts]);

  // Per-category counts for the chip strip so users see how many items are
  // available at the currently-selected hub before they tap into a category.
  const categoryCounts = useMemo(() => {
    const counts = { all: stationProducts.length };
    for (const cat of categories) {
      counts[cat.id] = stationProducts.filter(
        (p) => inferCategory(p) === cat.id,
      ).length;
    }
    return counts;
  }, [stationProducts]);

  const currentCategory = categories.find((c) => c.id === id);
  const currentStation = stations.find((s) => s.id === selectedStationId);

  return (
    <div className="max-w-md mx-auto">
      <div className="sticky top-[var(--header-h)] bg-white z-10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="flex-1 font-bold text-gray-800">
            {currentCategory ? currentCategory.name : '全部商品'}
          </h1>
          <Link
            to="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Hub switcher */}
        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Store className="w-3.5 h-3.5" />
            配送站
          </div>
          {stationsLoading && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              加载站点...
            </div>
          )}
          {!stationsLoading && stations.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {stations.map((s) => {
                const active = selectedStationId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStation(s.id)}
                    className={`group shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                    />
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}
          {currentStation && (
            <p className="text-[11px] text-gray-400 mt-1 truncate">
              {currentStation.address}
            </p>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          <Link
            to="/category"
            className={`px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
              !id ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'bg-gray-100 text-gray-600'
            }`}
          >
            全部
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                !id ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {categoryCounts.all}
            </span>
          </Link>
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const disabled = count === 0;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className={`px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
                  id === cat.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : disabled
                      ? 'bg-gray-50 text-gray-300'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.name}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    id === cat.id
                      ? 'bg-white/25 text-white'
                      : disabled
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {stationProductsLoading
              ? '加载中...'
              : stationProductsError
                ? stationProductsError
                : `共 ${filteredProducts.length} 件商品${
                    filteredProducts.length !== stationProducts.length
                      ? `（已选 ${currentCategory?.name || '该分类'}）`
                      : ''
                  }`}
          </p>
          <button
            onClick={() =>
              selectedStationId && fetchProductsForStation(selectedStationId)
            }
            className="text-xs text-gray-400 flex items-center gap-1 hover:text-blue-600 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors"
            title="刷新商品列表"
          >
            <RefreshCw className="w-3 h-3" />
            刷新
          </button>
        </div>
        {stationProductsLoading && (
          <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载该站点商品...
          </div>
        )}
        {!stationProductsLoading && !stationProductsError && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {stationProducts.length === 0
                    ? `${currentStation?.name || '该配送站'}暂无商品`
                    : `${currentCategory?.name || '该分类'}在${
                        currentStation?.name || '该配送站'
                      }暂无商品`}
                </p>
                {stationProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 mt-1">
                    试试切换到其它配送站
                  </p>
                ) : (
                  <button
                    onClick={() => setSelectedStation(stations[0].id)}
                    className="text-xs text-blue-600 mt-3 hover:underline"
                  >
                    切换到 {stations[0].name} 看看 →
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {!stationProductsLoading && stationProductsError && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-red-600 text-sm">{stationProductsError}</p>
          </div>
        )}
      </div>
    </div>
  );
}