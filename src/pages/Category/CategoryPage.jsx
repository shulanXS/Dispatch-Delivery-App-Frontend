import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import ProductCard from '../../components/ProductCard';

export default function CategoryPage() {
  const { id } = useParams();
  const categories = useProductStore((state) => state.categories);
  const products = useProductStore((state) => state.products);
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = id
    ? products.filter((p) => p.category === id)
    : products;

  const currentCategory = categories.find((c) => c.id === id);

  return (
    <div className="max-w-md mx-auto">
      {/* 顶部导航 */}
      <div className="sticky top-[56px] bg-white z-10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="flex-1 font-bold text-gray-800">
            {currentCategory ? currentCategory.name : '全部商品'}
          </h1>
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* 分类切换 */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          <Link
            to="/category"
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              !id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                id === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">共 {filteredProducts.length} 件商品</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无商品</p>
          </div>
        )}
      </div>
    </div>
  );
}
