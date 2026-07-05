import { create } from 'zustand';

// The delivery method is part of the UI contract and not driven by
// backend. We expose a single setter; pages read it and the
// CheckoutPage can render it as disabled/visible.
export const useDeliveryStore = create((set) => ({
  deliveryMethod: 'drone', // 'drone' | 'robot' (robot not yet supported)
  logisticsInfo: null,

  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  setLogisticsInfo: (info) => set({ logisticsInfo: info }),
  clearLogisticsInfo: () => set({ logisticsInfo: null }),
}));
