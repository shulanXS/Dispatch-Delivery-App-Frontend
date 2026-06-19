import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Plane, Truck, ChevronRight } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';

export default function OrderDetailPage() {
  const { id } = useParams();
  const getOrderById = useOrderStore((state) => state.getOrderById);
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p className="text-gray-500">订单不存在</p>
        <Link to="/" className="text-blue-600 mt-4 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-md mx-auto pb-8">
      {/* 顶部 */}
      <div className="sticky top-[56px] bg-white z-10 px-4 py-3 shadow-sm flex items-center gap-3">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-gray-800">订单详情</h1>
      </div>

      {/* 订单状态 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <p className="text-sm opacity-90">订单状态</p>
        <p className="text-2xl font-bold mt-1">{getStatusText(order.status)}</p>
        <p className="text-sm opacity-90 mt-2">
          预计送达: {order.estimatedTime}
        </p>
      </div>

      {/* 配送信息 */}
      <div className="mx-4 -mt-4 bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          {order.deliveryMethod === 'drone' ? (
            <Plane className="w-8 h-8 text-blue-600" />
          ) : (
            <Truck className="w-8 h-8 text-green-600" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {order.deliveryMethod === 'drone' ? '无人机配送' : '地面机器人配送'}
            </p>
            <p className="text-sm text-gray-500">{order.address.detail}</p>
          </div>
        </div>
      </div>

      {/* 收货地址 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="font-medium">{order.address.name}</p>
            <p className="text-sm text-gray-500">{order.address.phone}</p>
            <p className="text-sm text-gray-600 mt-1">{order.address.detail}</p>
          </div>
        </div>
      </div>

      {/* 订单信息 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">订单信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">订单编号</span>
            <span className="font-mono">{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">下单时间</span>
            <span>{formatTime(order.createTime)}</span>
          </div>
        </div>
      </div>

      {/* 商品清单 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">商品清单</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
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

      {/* 金额明细 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">商品金额</span>
            <span>¥{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">配送费</span>
            <span>+¥{order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">优惠</span>
            <span className="text-red-500">-¥{order.discount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
            <span>实付金额</span>
            <span className="text-blue-600">
              ¥{(order.totalAmount + order.deliveryFee - order.discount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 查看物流 */}
      <div className="mx-4 mt-6">
        <Link
          to={`/logistics/${order.orderId}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          查看物流追踪
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

function getStatusText(status) {
  const statusMap = {
    confirmed: '订单已确认',
    preparing: '商品备货中',
    shipping: '配送中',
    arriving: '即将送达',
    done: '已送达',
  };
  return statusMap[status] || '未知状态';
}
