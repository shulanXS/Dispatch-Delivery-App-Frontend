import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plane, Truck, MapPin, Clock, Battery, Zap } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useEffect, useState } from 'react';

export default function LogisticsPage() {
  const { id } = useParams();
  const getOrderById = useOrderStore((state) => state.getOrderById);
  const getMockLogistics = useDeliveryStore((state) => state.getMockLogistics);
  const order = getOrderById(id);

  const [logistics, setLogistics] = useState(null);

  useEffect(() => {
    if (order) {
      const info = getMockLogistics(id, order.deliveryMethod);
      setLogistics(info);
    }
  }, [id, order, getMockLogistics]);

  if (!order || !logistics) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p className="text-gray-500">物流信息不存在</p>
        <Link to="/" className="text-blue-600 mt-4 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  const isDrone = order.deliveryMethod === 'drone';

  return (
    <div className="max-w-md mx-auto pb-8">
      {/* 顶部 */}
      <div className="sticky top-[56px] bg-white z-10 px-4 py-3 shadow-sm flex items-center gap-3">
        <Link to={`/order/${id}`} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-gray-800">物流追踪</h1>
      </div>

      {/* 配送设备状态 */}
      <div className={`mx-4 mt-4 p-4 rounded-xl ${isDrone ? 'bg-blue-50' : 'bg-green-50'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDrone ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {isDrone ? (
              <Plane className="w-8 h-8 text-blue-600" />
            ) : (
              <Truck className="w-8 h-8 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {isDrone ? '无人机配送中' : '配送机器人运行中'}
            </p>
            <p className="text-sm text-gray-500">订单号: {order.orderId}</p>
          </div>
        </div>

        {/* 设备信息 */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">距离</span>
            </div>
            <p className="font-bold text-lg mt-1">{logistics.equipment.distance}m</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Zap className="w-4 h-4" />
              <span className="text-xs">速度</span>
            </div>
            <p className="font-bold text-lg mt-1">{logistics.equipment.speed}km/h</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Battery className="w-4 h-4" />
              <span className="text-xs">电量</span>
            </div>
            <p className="font-bold text-lg mt-1">{logistics.equipment.battery}%</p>
          </div>
        </div>
      </div>

      {/* 预计送达时间 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
        <Clock className="w-6 h-6 text-blue-600" />
        <div>
          <p className="text-sm text-gray-500">预计送达时间</p>
          <p className="font-bold text-lg">{order.estimatedTime}</p>
        </div>
      </div>

      {/* 配送状态时间线 */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-medium mb-4">配送进度</h3>
        <div className="space-y-0">
          {logistics.steps.map((step, index) => (
            <div key={step.status} className="flex gap-4">
              {/* 时间线 */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  index <= logistics.currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`} />
                {index < logistics.steps.length - 1 && (
                  <div className={`w-0.5 h-12 ${
                    index < logistics.currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
              {/* 内容 */}
              <div className={`flex-1 pb-6 ${index <= logistics.currentStep ? '' : 'opacity-50'}`}>
                <p className={`font-medium ${index === logistics.currentStep ? 'text-blue-600' : 'text-gray-800'}`}>
                  {step.text}
                </p>
                {step.time && (
                  <p className="text-sm text-gray-500 mt-1">{step.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 模拟地图区域 */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-6 min-h-40 flex items-center justify-center">
        <div className="text-center">
          {isDrone ? (
            <Plane className="w-16 h-16 text-blue-600 mx-auto animate-bounce" />
          ) : (
            <Truck className="w-16 h-16 text-green-600 mx-auto" />
          )}
          <p className="mt-4 text-gray-600 font-medium">
            {isDrone ? '无人机正在空中飞行' : '配送机器人正在配送途中'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            距您还有 {logistics.equipment.distance} 米
          </p>
        </div>
      </div>

      {/* 返回订单 */}
      <div className="mx-4 mt-6">
        <Link
          to={`/order/${id}`}
          className="block w-full py-3 text-center text-blue-600 font-medium"
        >
          返回订单详情
        </Link>
      </div>
    </div>
  );
}
