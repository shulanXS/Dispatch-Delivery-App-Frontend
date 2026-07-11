import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plane,
  Truck,
  MapPin,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import * as ordersApi from '../../api/orders';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { formatDateTime, formatTime } from '../../utils/datetime';

// Status 0=PENDING, 1=ASSIGNED, 2=DELIVERED, 3=COMPLETED
const STATUS_TEXT = {
  0: '订单已确认',
  1: '正在配送中',
  2: '已送达',
  3: '已完成',
};
// Per-mode descriptions so drone vs. robot reads naturally.
const STATUS_DESC_DRONE = {
  0: '正在为您准备商品',
  1: '无人机已从配送站起飞，正在前往目的地',
  2: '包裹已抵达目的地，请查收',
  3: '订单已圆满完成，期待再次光临～',
};
const STATUS_DESC_ROBOT = {
  0: '正在为您准备商品',
  1: '地面机器人已从配送站出发，正在前往目的地',
  2: '包裹已抵达目的地，请查收',
  3: '订单已圆满完成，期待再次光临～',
};
const STATUS_GRADIENT = {
  0: 'from-slate-500 to-slate-600',
  1: 'from-blue-500 to-indigo-600',
  2: 'from-emerald-500 to-teal-600',
  3: 'from-purple-500 to-fuchsia-600',
};

const TIMELINE_STEPS = [
  { key: 'created', label: '订单已确认', match: (s) => true, get: (o) => o.createdAt },
  { key: 'assigned', label: '已分配', match: (s) => s >= 1, get: (o) => o.assignedAt },
  { key: 'delivered', label: '已送达', match: (s) => s >= 2, get: (o) => o.deliveredAt },
  { key: 'completed', label: '已完成', match: (s) => s >= 3, get: (o) => o.completedAt },
];

const DELIVERY_FEE_BY_MODE = {
  DRONE: 2.99,
  ROBOT: 1.99,
};

export default function OrderDetailPage() {
  const { orderNo } = useParams();
  const user = useAuthStore((s) => s.user);
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const myOrders = useOrderStore((s) => s.myOrders);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        let summary =
          (currentOrder && currentOrder.orderNo === orderNo && currentOrder) ||
          (myOrders || []).find((o) => o.orderNo === orderNo) ||
          null;

        if (!summary) {
          const list = await ordersApi.getOrdersForCurrentUser();
          summary = (list || []).find((o) => o.orderNo === orderNo);
        }
        if (!summary) throw new Error('订单不存在');

        const detail = await ordersApi.getOrderById(summary.id);
        const orderEntity = detail.order || detail;
        const lineItems = detail.items || [];
        const merged = { ...orderEntity, items: lineItems };
        if (!cancelled) setOrder(merged);
      } catch (err) {
        if (!cancelled) setError(err.normalizedMessage || err.message || '加载订单失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, orderNo, currentOrder, myOrders]);

  if (loading) {
    return <LoadingState label="加载订单中..." className="pt-16" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto p-4">
        <PageHeader title="订单详情" back backTo="/" />
        <ErrorState message={error || '订单不存在'} className="py-16" />
      </div>
    );
  }

  const isDrone = (order.deliveryMode || 'DRONE').toUpperCase() === 'DRONE';
  const VehicleIcon = isDrone ? Plane : Truck;
  const vehicleLabel = isDrone ? '无人机' : '地面机器人';
  const deliveryModeUpper = (order.deliveryMode || 'DRONE').toUpperCase();
  const deliveryFee =
    DELIVERY_FEE_BY_MODE[deliveryModeUpper] ?? DELIVERY_FEE_BY_MODE.DRONE;
  const gradient = STATUS_GRADIENT[order.status] || STATUS_GRADIENT[0];
  const deliveryAddress =
    order.deliveryAddress || user?.address || '下单时选择的配送点';
  const userDefaultAddress = user?.address || '';
  const showDefault =
    userDefaultAddress && !order.deliveryAddress;

  return (
    <div className="max-w-md mx-auto pb-10">
      <PageHeader
        title={`订单 ${order.orderNo}`}
        subtitle={STATUS_TEXT[order.status]}
        back
        backTo="/"
      />

      <div className={`bg-gradient-to-br ${gradient} text-white p-6 pb-10 relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-4 bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
        <p className="text-sm opacity-90 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          下单于 {formatTime(order.createdAt)}
        </p>
        <p className="text-3xl font-bold mt-2 flex items-center gap-2">
          {STATUS_TEXT[order.status] || '未知状态'}
        </p>
        <p className="text-sm opacity-95 mt-2">
          {(isDrone ? STATUS_DESC_DRONE : STATUS_DESC_ROBOT)[order.status] ||
            '正在为您准备商品'}
        </p>
        {order.status >= 1 && order.status < 3 && (
          <p className="text-xs mt-4 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            预计 {isDrone ? '15-25' : '25-40'} 分钟内送达
          </p>
        )}
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-md border border-white relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm bg-gradient-to-br ${
              isDrone ? 'from-sky-500 to-blue-600' : 'from-emerald-500 to-teal-600'
            }`}
          >
            <VehicleIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800">{vehicleLabel}配送</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {order.assignedDroneId
                ? `${vehicleLabel} #${order.assignedDroneId} 已分配`
                : '系统正在为您分配最近的配送员'}
            </p>
          </div>
          {order.status === 1 && (
            <Link
              to={`/logistics/${order.orderNo}`}
              className="shrink-0 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              实时追踪 →
            </Link>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-medium mb-4">配送进度</h3>
        <ol className="relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const done = step.match(order.status);
            const time = step.get(order);
            const isLast = idx === TIMELINE_STEPS.length - 1;
            return (
              <li key={step.key} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      done
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 w-0.5 mt-1 ${
                        TIMELINE_STEPS[idx + 1].match(order.status)
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                      style={{ minHeight: 24 }}
                    />
                  )}
                </div>
                <div className="flex-1 -mt-0.5">
                  <p
                    className={`text-sm font-medium ${done ? 'text-gray-800' : 'text-gray-400'}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {time ? formatDateTime(time) : done ? '处理中' : '等待中…'}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{user?.name || '收件人'} 收</p>
            <p className="text-xs text-gray-400 mt-0.5">本次配送至</p>
            <p className="text-sm text-gray-700 mt-0.5 break-words">{deliveryAddress}</p>
            {showDefault && (
              <p className="text-xs text-gray-400 mt-2">
                来自你的默认地址：{userDefaultAddress}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">订单信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">订单编号</span>
            <span className="font-mono">{order.orderNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">下单时间</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          {order.assignedAt && (
            <div className="flex justify-between">
              <span className="text-gray-500">分配时间</span>
              <span>{formatDateTime(order.assignedAt)}</span>
            </div>
          )}
          {order.deliveredAt && (
            <div className="flex justify-between">
              <span className="text-gray-500">送达时间</span>
              <span>{formatDateTime(order.deliveredAt)}</span>
            </div>
          )}
          {order.completedAt && (
            <div className="flex justify-between">
              <span className="text-gray-500">完成时间</span>
              <span>{formatDateTime(order.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">商品清单</h3>
        <div className="space-y-3">
          {(order.items || []).map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.productImageUrl ? (
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  x{item.quantity} · 单价 ¥{Number(item.unitPrice).toFixed(2)}
                </p>
              </div>
              <p className="font-medium">
                ¥{(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">商品金额</span>
            <span>¥{Number(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">
              配送费（{isDrone ? '无人机' : '地面机器人'}）
            </span>
            <span>¥{Number(deliveryFee).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
            <span>实付金额</span>
            <span className="text-blue-600 text-lg">
              ¥{(Number(order.totalAmount) + Number(deliveryFee)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {order.status !== 3 && (
        <div className="mx-4 mt-6">
          <Link
            to={`/logistics/${order.orderNo}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-100 transition-colors"
          >
            查看物流追踪
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
