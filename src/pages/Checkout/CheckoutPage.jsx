import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Plane, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useOrderStore } from '../../store/useOrderStore';
import { addresses } from '../../mock/addresses';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const { deliveryMethod, setDeliveryMethod } = useDeliveryStore();
  const createOrder = useOrderStore((state) => state.createOrder);

  const selectedItems = items.filter((i) => i.selected);
  const totalPrice = getTotalPrice();
  const deliveryFee = deliveryMethod === 'drone' ? 5.0 : 3.0;
  const discount = 3.0;
  const finalPrice = totalPrice + deliveryFee - discount;
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;

    const order = createOrder({
      items: selectedItems,
      totalAmount: totalPrice,
      deliveryMethod,
      deliveryFee,
      discount,
      address: defaultAddress,
      estimatedTime: deliveryMethod === 'drone' ? '15-25分钟' : '20-30分钟',
    });

    clearCart();
    navigate(`/order/${order.orderId}`);
  };

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p className="text-gray-500 mb-4">购物车为空</p>
        <Link to="/category" className="text-blue-600">
          去选购
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* 顶部 */}
      <div className="sticky top-[56px] bg-white z-10 px-4 py-3 shadow-sm flex items-center gap-3">
        <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-gray-800">订单结算</h1>
      </div>

      {/* 收货地址 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-1" />
          <div className="flex-1">
            <p className="font-medium">{defaultAddress.name}</p>
            <p className="text-sm text-gray-500">{defaultAddress.phone}</p>
            <p className="text-sm text-gray-600 mt-1">{defaultAddress.detail}</p>
          </div>
        </div>
      </div>

      {/* 配送方式 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">配送方式</h3>
        <div className="space-y-3">
          <label
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              deliveryMethod === 'drone'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="delivery"
              value="drone"
              checked={deliveryMethod === 'drone'}
              onChange={() => setDeliveryMethod('drone')}
              className="hidden"
            />
            <Plane className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">无人机配送</p>
              <p className="text-sm text-gray-500">15-25分钟送达</p>
            </div>
            <span className="text-blue-600 font-medium">¥5.00</span>
            {deliveryMethod === 'drone' && (
              <Check className="w-5 h-5 text-blue-600" />
            )}
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              deliveryMethod === 'robot'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="delivery"
              value="robot"
              checked={deliveryMethod === 'robot'}
              onChange={() => setDeliveryMethod('robot')}
              className="hidden"
            />
            <Truck className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <p className="font-medium">地面机器人配送</p>
              <p className="text-sm text-gray-500">20-30分钟送达</p>
            </div>
            <span className="text-green-600 font-medium">¥3.00</span>
            {deliveryMethod === 'robot' && (
              <Check className="w-5 h-5 text-green-600" />
            )}
          </label>
        </div>
      </div>

      {/* 商品清单 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-medium mb-3">商品清单</h3>
        <div className="space-y-3">
          {selectedItems.map((item) => (
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
            <span>¥{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">配送费</span>
            <span>+¥{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">优惠</span>
            <span className="text-red-500">-¥{discount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>实付金额</span>
            <span className="text-blue-600 text-lg">¥{finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 max-w-md mx-auto">
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          提交订单
        </button>
      </div>
    </div>
  );
}
