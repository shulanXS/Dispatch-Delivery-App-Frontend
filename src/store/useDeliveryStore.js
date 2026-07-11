import { create } from 'zustand';

// Delivery mode is part of the UI contract — the user picks drone vs
// robot at checkout and the value flows into:
//   - POST /orders/plans  (mode influences which hubs are feasible)
//   - POST /orders        (mode drives backend vehicle assignment)
// We mirror backend's enum names ('DRONE' | 'ROBOT') in CAPS so the
// camel→snake interceptor ships the right wire value without extra
// mapping. The CheckoutPage still receives a lowercase label for the
// cart icon, but everything that hits the network uses this canonical
// casing.
export const useDeliveryStore = create((set) => ({
  deliveryMethod: 'DRONE', // 'DRONE' | 'ROBOT'
  logisticsInfo: null,

  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  setLogisticsInfo: (info) => set({ logisticsInfo: info }),
  clearLogisticsInfo: () => set({ logisticsInfo: null }),
}));
