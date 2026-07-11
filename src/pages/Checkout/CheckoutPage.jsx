import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plane,
  Truck,
  Check,
  Loader2,
  Sparkles,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { presetAddresses, findAddressById } from '../../data/presets';
import * as ordersApi from '../../api/orders';

const DELIVERY_OPTIONS = [
  {
    method: 'DRONE',
    label: '无人机配送',
    sublabel: '15-25 分钟送达 · 空中直达',
    icon: Plane,
    accent: 'from-sky-500 to-blue-600',
    color: 'text-sky-600',
    eta: '15-25min',
    fee: 2.99,
  },
  {
    method: 'ROBOT',
    label: '地面机器人配送',
    sublabel: '25-40 分钟送达 · 大件优选',
    icon: Truck,
    accent: 'from-emerald-500 to-teal-600',
    color: 'text-emerald-600',
    eta: '25-40min',
    fee: 1.99,
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const { deliveryMethod, setDeliveryMethod } = useDeliveryStore();
  const setCurrentOrderFromBackend = useOrderStore(
    (s) => s.setCurrentOrderFromBackend,
  );
  const user = useAuthStore((s) => s.user);

  const [addressId, setAddressId] = useState(presetAddresses[0].id);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const selectedItems = items.filter((i) => i.selected);
  const totalPrice = getTotalPrice();
  const selectedAddress = findAddressById(addressId);

  // Fetch delivery plans whenever cart / address / mode changes.
  useEffect(() => {
    let cancelled = false;
    async function loadPlans() {
      if (selectedItems.length === 0) {
        setPlans([]);
        setSelectedStationId(null);
        return;
      }
      setPlansLoading(true);
      setPlansError(null);
      try {
        const data = await ordersApi.getDeliveryPlans({
          longitude: selectedAddress.longitude,
          latitude: selectedAddress.latitude,
          items: selectedItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          deliveryMode: deliveryMethod,
        });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setPlans(list);
        const firstFeasible = list.find((p) => p.feasible) || null;
        setSelectedStationId(firstFeasible?.stationId ?? null);
      } catch (err) {
        if (cancelled) return;
        setPlansError(err.normalizedMessage || '获取配送方案失败');
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    }
    loadPlans();
    return () => {
      cancelled = true;
    };
  }, [
    JSON.stringify(selectedItems.map((i) => i.productId + ':' + i.quantity)),
    addressId,
    deliveryMethod,
  ]);

  const selectedPlan = plans.find((p) => p.stationId === selectedStationId);
  const activeOption = DELIVERY_OPTIONS.find((o) => o.method === deliveryMethod);

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 text-center pt-16">
        <p className="text-gray-500 mb-4">购物车为空</p>
        <Link to="/category" className="text-blue-600">
          去选购
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedStationId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await ordersApi.createOrder({
        stationId: selectedStationId,
        longitude: selectedAddress.longitude,
        latitude: selectedAddress.latitude,
        deliveryAddress: `${selectedAddress.label} · ${selectedAddress.detail}`,
        deliveryMode: deliveryMethod,
        items: selectedItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      const order = response.order || response;
      setCurrentOrderFromBackend(order);
      clearCart();
      navigate(`/order/${order.orderNo}`, { replace: true });
    } catch (err) {
      setSubmitError(err.normalizedMessage || '提交订单失败');
      setSubmitting(false);
    }
  };

  const deliveryFee = selectedPlan?.estimatedCost ?? activeOption?.fee ?? 0;
  const etaMinutes = selectedPlan?.estimatedMinutes;

  return (
    <div className="max-w-md mx-auto pb-32">
      <div className="sticky top-[var(--header-h)] bg-white/95 backdrop-blur z-10 px-4 py-3 shadow-sm flex items-center gap-3">
        <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-gray-800 flex-1">订单结算</h1>
        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          安全结算
        </span>
      </div>

      {/* Address picker */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              配送至：{user?.name || '当前用户'}
            </p>
            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
              className="mt-1 block w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500"
            >
              {presetAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {a.detail}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              坐标 ({selectedAddress.longitude.toFixed(4)},{' '}
              {selectedAddress.latitude.toFixed(4)})
            </p>
          </div>
        </div>
      </div>

      {/* Delivery method (drone + robot both real-selectable) */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">配送方式</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DELIVERY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = deliveryMethod === opt.method;
            return (
              <label
                key={opt.method}
                className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  active
                    ? 'border-blue-500 bg-blue-50/60 shadow-md shadow-blue-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={opt.method}
                  checked={active}
                  onChange={() => setDeliveryMethod(opt.method)}
                  className="hidden"
                />
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${opt.accent} text-white shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {opt.sublabel}
                </p>
                {active && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Hub plans */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">配送方案</h3>
          {etaMinutes != null && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> 约 {etaMinutes} 分钟
            </span>
          )}
        </div>
        {plansLoading && (
          <div className="text-sm text-gray-500 flex items-center gap-2 py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在计算{deliveryMethod === 'ROBOT' ? '地面机器人' : '无人机'}配送方案…
          </div>
        )}
        {plansError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
            {plansError}
          </div>
        )}
        {!plansLoading && !plansError && (
          <div className="space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.stationId}
                disabled={!plan.feasible}
                onClick={() => setSelectedStationId(plan.stationId)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedStationId === plan.stationId
                    ? 'border-blue-500 bg-blue-50/60 shadow-sm shadow-blue-50'
                    : plan.feasible
                      ? 'border-gray-100 hover:border-blue-200'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{plan.stationName}</p>
                  {selectedStationId === plan.stationId && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{plan.stationAddress}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    距离 {plan.distanceKm?.toFixed?.(2) ?? '—'} km
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    {deliveryMethod === 'ROBOT' ? '机器人' : '无人机'}{' '}
                    {plan.availableDrones ?? 0}
                  </span>
                  {plan.estimatedMinutes != null && (
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      <Clock className="w-3 h-3" />
                      约 {plan.estimatedMinutes} 分钟
                    </span>
                  )}
                  <span className="ml-auto font-semibold text-gray-800">
                    ¥{Number(plan.totalAmount).toFixed(2)}
                  </span>
                </div>
                {!plan.feasible && plan.infeasibilityReason && (
                  <p className="text-xs text-red-500 mt-1">
                    {plan.infeasibilityReason}
                  </p>
                )}
              </button>
            ))}
            {plans.length === 0 && (
              <p className="text-sm text-gray-400">暂无方案</p>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">商品清单</h3>
        <div className="space-y-3">
          {selectedItems.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
              <p className="font-medium">
                ¥{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">商品金额</span>
            <span>¥{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">
              配送费{deliveryMethod === 'DRONE' ? '（无人机）' : '（机器人）'}
            </span>
            <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
              {deliveryFee === 0 ? '¥0.00' : `¥${Number(deliveryFee).toFixed(2)}`}
            </span>
          </div>
          {selectedPlan?.estimatedMinutes != null && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>预计送达时间</span>
              <span>{selectedPlan.estimatedMinutes} 分钟</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
            <span>实付金额</span>
            <span className="text-blue-600 text-lg">
              ¥{(totalPrice + Number(deliveryFee)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mx-4 mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {submitError}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t px-4 py-4 max-w-md mx-auto">
        <button
          onClick={handleSubmit}
          disabled={
            submitting ||
            !selectedStationId ||
            !selectedPlan?.feasible
          }
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting
            ? '提交中...'
            : `提交订单 · ¥${(totalPrice + Number(deliveryFee)).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
