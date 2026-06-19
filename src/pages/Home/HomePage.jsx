import { Link } from 'react-router-dom';
import { MapPin, Clock, Zap, Truck } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';

export default function HomePage() {
  const categories = useProductStore((state) => state.categories);

  return (
    <div className="max-w-md mx-auto">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold">欢迎来到派送配送</h1>
        <p className="mt-2 text-blue-100 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>科技园店 | 营业中</span>
        </p>
      </div>

      {/* 配送方式 */}
      <div className="bg-white mx-4 -mt-4 rounded-xl shadow-md p-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-green-600">
          <Zap className="w-5 h-5" />
          <span className="text-sm font-medium">极速配送</span>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <Truck className="w-5 h-5" />
          <span className="text-sm font-medium">无人配送</span>
        </div>
        <div className="flex items-center gap-2 text-orange-500">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">15-25分钟</span>
        </div>
      </div>

      {/* 分类入口 */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">商品分类</h2>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-1">{getCategoryEmoji(category.id)}</span>
              <span className="text-xs text-gray-600">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 活动区域 */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">热门活动</h2>
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-xl">
            <p className="font-bold">限时优惠</p>
            <p className="text-sm opacity-90">全场满49减10</p>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-xl">
            <p className="font-bold">新人专享</p>
            <p className="text-sm opacity-90">首单立减15元</p>
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">快速入口</h2>
        <Link
          to="/category"
          className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          立即选购
        </Link>
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
