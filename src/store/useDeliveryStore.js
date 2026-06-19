import { create } from 'zustand';

export const useDeliveryStore = create((set) => ({
  deliveryMethod: 'drone',
  logisticsInfo: null,

  setDeliveryMethod: (method) => set({ deliveryMethod: method }),

  setLogisticsInfo: (info) => set({ logisticsInfo: info }),

  getMockLogistics: (orderId, method = 'drone') => ({
    orderId,
    currentStep: 1,
    steps: [
      { status: 'confirmed', text: '订单确认', time: '14:00' },
      { status: 'preparing', text: '商品备货中', time: '14:05' },
      { status: 'shipping', text: method === 'drone' ? '无人机配送中' : '配送中', time: '14:15' },
      { status: 'arriving', text: '即将送达', time: '' },
      { status: 'done', text: '已送达', time: '' },
    ],
    equipment: {
      type: method,
      distance: 1200,
      speed: 36,
      battery: 85,
    },
  }),
}));
