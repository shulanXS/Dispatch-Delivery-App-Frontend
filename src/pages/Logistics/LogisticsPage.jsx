import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plane,
  Truck,
  MapPin,
  Clock,
  Battery,
  Gauge,
  Wind,
  Signal,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import * as ordersApi from '../../api/orders';
import { usePolling } from '../../hooks/usePolling';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const STATUS_TEXT = {
  0: '订单已确认',
  1: '正在配送中',
  2: '已送达',
  3: '已完成',
};

// Each step has two booleans:
//   match(status)  — is this step already done?
//   active(status) — is this step the *current* one we should highlight?
// A completed step is no longer active; the in-flight step is the one
// without a terminal timestamp yet. For status=0 (PENDING — currently
// unused by the backend but reserved) "preparing" is active; for
// status=1 it's "enroute"; for status=2 it's "delivered"; for 3 it's
// "completed".
const TIMELINE_STEPS = [
  { key: 'created', label: '订单已确认', get: (o) => o.createdAt, match: () => true, active: () => false },
  {
    key: 'preparing',
    label: '备货中',
    get: (o) => o.assignedAt || o.createdAt,
    match: (s) => s >= 0,
    active: (s) => s === 0,
    pendingHint: '商家正在备货，请稍候…',
  },
  {
    key: 'assigned',
    label: '配送员已出发',
    get: (o) => o.assignedAt,
    match: (s) => s >= 1,
    active: () => false,
  },
  {
    key: 'enroute',
    label: '前往目的地',
    get: (o) => o.deliveredAt || o.assignedAt,
    match: (s) => s >= 2,
    active: (s) => s === 1,
    pendingHint: '配送员正在路上…',
  },
  { key: 'delivered', label: '已抵达', get: (o) => o.deliveredAt, match: (s) => s >= 2, active: (s) => s === 2 },
  { key: 'completed', label: '已完成', get: (o) => o.completedAt, match: (s) => s >= 3, active: (s) => s >= 3 },
];

function project(W, H, minLng, maxLng, minLat, maxLat, lng, lat) {
  const x = ((lng - minLng) / (maxLng - minLng)) * W;
  const y = H - ((lat - minLat) / (maxLat - minLat)) * H;
  return [x, y];
}

function haversineKm(p1, p2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLng = toRad(p2.longitude - p1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.latitude)) *
      Math.cos(toRad(p2.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function VisualDrone({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
      <defs>
        <linearGradient id="drone-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="14" y="2" width="8" height="6" rx="1" fill="#0f172a" />
      <circle cx="18" cy="18" r="7" fill="url(#drone-body)" stroke="white" strokeWidth="1.4" />
      <circle cx="18" cy="18" r="2.5" fill="white" />
      <rect x="3" y="15" width="30" height="3" rx="1.5" fill="#1e3a8a" />
      <circle cx="6" cy="18" r="3.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
      <circle cx="30" cy="18" r="3.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
    </svg>
  );
}

function VisualRobot({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
      <defs>
        <linearGradient id="robot-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect x="4" y="11" width="28" height="13" rx="2.5" fill="url(#robot-body)" stroke="white" strokeWidth="1.2" />
      <rect x="9" y="14" width="18" height="6" rx="1" fill="#ecfeff" />
      <circle cx="14" cy="17" r="1.6" fill="#0f766e" />
      <circle cx="22" cy="17" r="1.6" fill="#0f766e" />
      <rect x="6" y="24" width="6" height="3" rx="1" fill="#065f46" />
      <rect x="24" y="24" width="6" height="3" rx="1" fill="#065f46" />
      <circle cx="8" cy="14" r="1.5" fill="#fef08a" />
      <circle cx="28" cy="14" r="1.5" fill="#fef08a" />
    </svg>
  );
}

const COLOR_MAP = {
  blue: 'text-blue-500 bg-blue-50',
  emerald: 'text-emerald-500 bg-emerald-50',
  amber: 'text-amber-500 bg-amber-50',
  slate: 'text-slate-500 bg-slate-100',
};

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="text-white">
      <div className="flex items-center gap-1.5 opacity-90 text-xs">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 border border-gray-100">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${COLOR_MAP[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function formatTime(value) {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? new Date(value.replace(' ', 'T')) : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return '—';
  }
}

export default function LogisticsPage() {
  const { orderNo } = useParams();
  const user = useAuthStore((s) => s.user);
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const myOrders = useOrderStore((s) => s.myOrders);

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadOrder() {
      if (!user?.id) return;
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
        const merged = {
          ...(detail.order || detail),
          items: detail.items || [],
        };
        if (!cancelled) setOrder(merged);
      } catch (err) {
        if (!cancelled)
          setError(err.normalizedMessage || err.message || '加载订单失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [user?.id, orderNo, currentOrder, myOrders]);

  usePolling(
    async () => {
      if (!order?.id) return;
      try {
        const data = await ordersApi.getOrderTracking(order.id);
        setTracking(data);
      } catch (_) {
        // 静默错误 - UI 保留上次快照
      }
    },
    4000,
    Boolean(order) && (order?.status ?? 0) < 3,
  );

  // Hooks must run unconditionally on every render — compute derived
  // values here, regardless of whether `order` exists yet.
  const vehicleMode = (
    tracking?.vehicleMode ||
    order?.deliveryMode ||
    'DRONE'
  ).toUpperCase();
  const isDrone = vehicleMode === 'DRONE';
  const status = tracking?.orderStatus !== undefined && tracking?.orderStatus !== null
    ? tracking.orderStatus
    : order?.status ?? 0;
  const isDelivered = status >= 2;

  const svgState = useMemo(() => {
    if (
      !tracking ||
      !tracking.stationPosition ||
      !tracking.deliveryDestination
    ) {
      return null;
    }
    const stationLng = tracking.stationPosition.longitude;
    const stationLat = tracking.stationPosition.latitude;
    const deliveryLng = tracking.deliveryDestination.longitude;
    const deliveryLat = tracking.deliveryDestination.latitude;
    let vehLng = stationLng;
    let vehLat = stationLat;
    const lngs = [stationLng, deliveryLng];
    const lats = [stationLat, deliveryLat];
    if (tracking.dronePosition) {
      vehLng = tracking.dronePosition.longitude;
      vehLat = tracking.dronePosition.latitude;
      lngs.push(vehLng);
      lats.push(vehLat);
    }
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const pad = (range) => Math.max(range * 0.25, 0.005);
    const minLng = Math.min(...lngs) - pad(lngRange);
    const maxLng = Math.max(...lngs) + pad(lngRange);
    const minLat = Math.min(...lats) - pad(latRange);
    const maxLat = Math.max(...lats) + pad(latRange);
    const W = 360;
    const H = 220;
    const [sx, sy] = project(W, H, minLng, maxLng, minLat, maxLat, stationLng, stationLat);
    const [dx, dy] = project(W, H, minLng, maxLng, minLat, maxLat, deliveryLng, deliveryLat);
    const [px, py] = project(W, H, minLng, maxLng, minLat, maxLat, vehLng, vehLat);
    // heading direction (degrees from start to current vehicle)
    const headingDeg = (() => {
      const rad = Math.atan2(py - sy, px - sx);
      return (rad * 180) / Math.PI;
    })();
    return { W, H, sx, sy, dx, dy, px, py, headingDeg };
  }, [tracking]);

  const distanceKm = useMemo(() => {
    if (!tracking?.dronePosition || !tracking?.deliveryDestination) return null;
    return haversineKm(tracking.dronePosition, tracking.deliveryDestination);
  }, [tracking]);

  const progressPct = useMemo(() => {
    if (!svgState) return 0;
    const dx = svgState.dx - svgState.sx;
    const dy = svgState.dy - svgState.sy;
    const px = svgState.px - svgState.sx;
    const py = svgState.py - svgState.sy;
    const full = dx * dx + dy * dy;
    if (full <= 0) return 0;
    const dot = px * dx + py * dy;
    return Math.max(2, Math.min(98, (dot / full) * 100));
  }, [svgState]);

  const speedMs = tracking?.droneSpeed ? Number(tracking.droneSpeed) : 0;
  const etaMinutes =
    distanceKm != null && speedMs > 0
      ? Math.max(1, Math.round((distanceKm * 1000) / speedMs / 60))
      : isDelivered
        ? 0
        : isDrone
          ? 22
          : 35;

  // Re-render every 30s so the "x 分钟前" pulse / ETA stays live without
  // requiring navigation events.
  useEffect(() => {
    const t = setInterval(() => setNowTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return <LoadingState label="加载追踪数据中..." className="pt-16" />;
  }
  if (error || !order) {
    return (
      <div className="max-w-md mx-auto p-4">
        <PageHeader title="物流追踪" back backTo={`/order/${orderNo}`} />
        <ErrorState message={error || '订单不存在'} className="py-16" />
      </div>
    );
  }

  const VehicleIcon = isDrone ? Plane : Truck;
  const Visual = isDrone ? VisualDrone : VisualRobot;
  const vehicleLabel = isDrone ? '无人机' : '地面机器人';
  const accentFrom = isDrone ? 'from-sky-500' : 'from-emerald-500';
  const accentTo = isDrone ? 'to-indigo-600' : 'to-teal-600';
  const strokeColor = isDrone ? '#3b82f6' : '#10b981';

  return (
    <div className="max-w-md mx-auto pb-10">
      <PageHeader
        title={isDrone ? '无人机追踪' : '机器人追踪'}
        subtitle={STATUS_TEXT[status]}
        back
        backTo={`/order/${orderNo}`}
      />

      <div
        className={`mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br ${accentFrom} ${accentTo} text-white shadow-xl shadow-sky-200/30`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
            <VehicleIcon className="w-9 h-9 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">
              {STATUS_TEXT[status] || '正在配送中'}
            </p>
            <p className="text-sm opacity-90 mt-0.5 truncate">
              {tracking?.droneCode
                ? `${vehicleLabel} ${tracking.droneCode}`
                : `订单号 ${orderNo}`}
            </p>
          </div>
          {!isDelivered && (
            <span className="text-xs px-2.5 py-1 bg-white/20 rounded-full flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
          <HeroStat
            icon={MapPin}
            label="剩余距离"
            value={distanceKm != null ? `${distanceKm.toFixed(2)} km` : '—'}
          />
          <HeroStat
            icon={Gauge}
            label="速度"
            value={speedMs > 0 ? `${speedMs.toFixed(0)} km/h` : '—'}
          />
          <HeroStat
            icon={Battery}
            label="电量"
            value={
              tracking?.droneBattery !== undefined && tracking?.droneBattery !== null
                ? `${tracking.droneBattery}%`
                : '—'
            }
          />
        </div>

        {!isDelivered && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs opacity-95 mb-1.5">
              <span>实时进度</span>
              <span className="font-semibold">{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white/95 transition-all duration-700 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {order.deliveryAddress && (
          <div className="mt-4 pt-4 border-t border-white/20 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 opacity-90" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide opacity-80">配送至</p>
              <p className="text-sm font-medium truncate">{order.deliveryAddress}</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Map */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            {isDrone ? '✈️ 空中航线' : '🚚 陆地路径'}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 起点
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> 终点
            </span>
          </div>
        </div>
        {svgState ? (
          <svg
            viewBox={`0 0 ${svgState.W} ${svgState.H}`}
            className="w-full h-60 rounded-xl bg-white shadow-inner"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              <marker
                id="arrow-head"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 完整路径（淡色背景） */}
            <line
              x1={svgState.sx}
              y1={svgState.sy}
              x2={svgState.dx}
              y2={svgState.dy}
              stroke={strokeColor}
              strokeWidth="2"
              strokeOpacity="0.18"
              strokeDasharray={isDrone ? '0' : '6 4'}
            />

            {/* 已飞航段（实线，带箭头） */}
            <line
              x1={svgState.sx}
              y1={svgState.sy}
              x2={svgState.px}
              y2={svgState.py}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrow-head)"
              className="transition-all duration-700"
            />

            {/* 待飞航段（虚线脉动） */}
            {!isDelivered && (
              <line
                x1={svgState.px}
                y1={svgState.py}
                x2={svgState.dx}
                y2={svgState.dy}
                stroke={strokeColor}
                strokeWidth="2"
                strokeDasharray="4 6"
                strokeOpacity="0.7"
                className="animate-pulse"
              />
            )}

            {/* 起点 hub */}
            <g>
              <circle cx={svgState.sx} cy={svgState.sy} r="11" fill="#dcfce7" />
              <circle cx={svgState.sx} cy={svgState.sy} r="6" fill="#10b981" />
              <circle cx={svgState.sx} cy={svgState.sy} r="2.5" fill="white" />
              <text
                x={svgState.sx + 14}
                y={svgState.sy + 4}
                fontSize="11"
                fill="#065f46"
                fontWeight="700"
              >
                起点
              </text>
            </g>

            {/* 终点 */}
            <g>
              <circle cx={svgState.dx} cy={svgState.dy} r="13" fill="#fee2e2" />
              <circle cx={svgState.dx} cy={svgState.dy} r="8" fill="#ef4444" />
              <path
                d={`M ${svgState.dx - 3} ${svgState.dy} L ${svgState.dx} ${svgState.dy - 4} L ${svgState.dx + 3} ${svgState.dy} L ${svgState.dx} ${svgState.dy + 4} z`}
                fill="white"
              />
              <text
                x={svgState.dx + 14}
                y={svgState.dy + 4}
                fontSize="11"
                fill="#7f1d1d"
                fontWeight="700"
              >
                送达点
              </text>
            </g>

            {/* 车辆 — 跟随方向旋转 */}
            <g
              style={{
                transform: `translate(${svgState.px}px, ${svgState.py}px) rotate(${isDrone ? 0 : svgState.headingDeg}deg)`,
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
            >
              {isDrone ? (
                <g>
                  <circle r="16" fill={strokeColor} fillOpacity="0.12">
                    <animate
                      attributeName="r"
                      values="12;22;12"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values="0.18;0.05;0.18"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ) : null}
              <foreignObject x="-18" y="-18" width="36" height="36">
                <Visual size={36} />
              </foreignObject>
            </g>
          </svg>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-gray-500 text-sm bg-white rounded-xl shadow-inner gap-2">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
            <span>
              {tracking ? '正在计算位置…' : `等待${vehicleLabel}${isDrone ? '起飞' : '出发'}…`}
            </span>
          </div>
        )}

        {!svgState && !tracking && order.status === 1 && (
          <p className="mt-3 text-xs text-center text-gray-500">
            系统正在为本次配送调度最近的{vehicleLabel}…
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-4">配送进度</h3>
        <ol className="relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const reached = step.match(status);
            const time = step.get(order);
            const isActive = step.active(status);
            const isLast = idx === TIMELINE_STEPS.length - 1;
            const accentBg = isDrone ? 'bg-blue-600' : 'bg-emerald-600';
            const accentRing = isDrone
              ? 'ring-blue-200 text-blue-600 bg-blue-50'
              : 'ring-emerald-200 text-emerald-600 bg-emerald-50';
            return (
              <li key={step.key} className="flex gap-3 pb-3 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      reached
                        ? `${accentBg} text-white`
                        : isActive
                          ? `${accentRing} ring-2 animate-pulse`
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {reached ? (
                      <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 w-0.5 mt-1 ${
                        TIMELINE_STEPS[idx + 1]?.match(status)
                          ? isDrone
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                          : 'bg-gray-200'
                      }`}
                      style={{ minHeight: 22 }}
                    />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p
                    className={`text-sm font-semibold ${
                      reached ? 'text-gray-800' : isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reached
                      ? time
                        ? formatTime(time)
                        : '已完成'
                      : isActive
                        ? step.pendingHint || '进行中…'
                        : '等待中…'}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={Clock}
          label="预计送达"
          value={isDelivered ? '已送达' : `约 ${etaMinutes} 分钟`}
          color="blue"
        />
        <StatCard
          icon={isDrone ? Wind : Gauge}
          label={isDrone ? '风速' : '路面'}
          value={isDrone ? '4 km/h' : '畅通'}
          color="emerald"
        />
        <StatCard icon={Signal} label="信号" value="满格" color="amber" />
        <StatCard
          icon={MapPin}
          label="配送站"
          value={order.stationId ? `#${order.stationId}` : '—'}
          color="slate"
        />
      </div>

      <div className="mx-4 mt-6">
        <Link
          to={`/order/${orderNo}`}
          className="block w-full py-3 text-center text-blue-600 font-medium hover:underline"
        >
          返回订单详情
        </Link>
      </div>
    </div>
  );
}
