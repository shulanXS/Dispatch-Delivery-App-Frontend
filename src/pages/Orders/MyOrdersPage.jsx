import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plane,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import * as ordersApi from '../../api/orders';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDateTime } from '../../utils/datetime';

const STATUS_TEXT = {
  0: '待处理',
  1: '配送中',
  2: '已送达',
  3: '已完成',
};

const STATUS_BADGE = {
  0: 'bg-gray-100 text-gray-600 border-gray-200',
  1: 'bg-blue-50 text-blue-700 border-blue-100',
  2: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  3: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function MyOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await ordersApi.getOrdersForCurrentUser();
      const sorted = (list || []).slice().sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setOrders(sorted);
    } catch (err) {
      setError(err.normalizedMessage || err.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="max-w-md mx-auto pb-8">
      <PageHeader
        title="我的订单"
        subtitle={orders.length > 0 ? `共 ${orders.length} 单` : '订单历史与状态'}
        back
        backTo="/"
      />

      {loading && <LoadingState label="加载订单中..." className="pt-16" />}

      {error && !loading && (
        <div className="mx-4 mt-4">
          <ErrorState message={error} onRetry={() => load()} compact />
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon="📦"
          title="还没有订单"
          description="去逛逛分类，把心仪的好物带回家"
          action={
            <Link
              to="/category"
              className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              去选购
            </Link>
          }
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="p-4 space-y-3">
          {orders.map((o) => {
            const isDrone = (o.deliveryMode || 'DRONE').toUpperCase() === 'DRONE';
            const VehicleIcon = isDrone ? Plane : Truck;
            return (
              <Link
                key={o.id}
                to={`/order/${o.orderNo}`}
                className="block bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-500">
                    {o.orderNo}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      STATUS_BADGE[o.status] || STATUS_BADGE[0]
                    }`}
                  >
                    {STATUS_TEXT[o.status] || '未知状态'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <VehicleIcon className={`w-4 h-4 ${isDrone ? 'text-sky-600' : 'text-emerald-600'}`} />
                    <span>{isDrone ? '无人机' : '地面机器人'}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(o.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 text-base">
                      ¥{Number(o.totalAmount).toFixed(2)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
