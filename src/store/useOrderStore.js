import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as ordersApi from '../api/orders';

const STATUS_DELIVERED = 2;
const STATUS_COMPLETED = 3;

// Backend is the source of truth for orders. This store is a thin
// cache: it keeps the most recently created order in memory so
// OrderDetailPage / LogisticsPage can resolve orderNo -> orderId
// without an extra round-trip, plus a list cache for MyOrdersPage.
export const useOrderStore = create(
  persist(
    (set, get) => ({
      currentOrder: null,
      myOrders: [],

      setCurrentOrderFromBackend(order) {
        if (!order) {
          set({ currentOrder: null });
          return;
        }
        const isFinal = order.status >= STATUS_DELIVERED;
        const filteredPrev = get().currentOrder
          ? get().currentOrder.status >= STATUS_DELIVERED
            ? [get().currentOrder]
            : [get().currentOrder, order]
          : [order];
        // Active orders stay at the head of the list so navigation home sees them.
        const myOrders = [
          ...filteredPrev.filter((o) => o.orderNo !== order.orderNo),
          order,
        ];
        if (isFinal) {
          set({ currentOrder: null, myOrders });
        } else {
          set({ currentOrder: order, myOrders });
        }
      },

      async fetchOrdersByUser() {
        try {
          const list = await ordersApi.getOrdersForCurrentUser();
          const sorted = (list || []).slice().sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });
          // Drop any "active" currentOrder that has actually been completed/delivered
          // so the home page doesn't keep showing a finished trip as live.
          const active =
            get().currentOrder &&
            (get().currentOrder.status === undefined ||
              get().currentOrder.status < STATUS_DELIVERED)
              ? get().currentOrder
              : null;
          set({ myOrders: sorted, currentOrder: active });
          return sorted;
        } catch (err) {
          return get().myOrders;
        }
      },

      getOrderNoToId() {
        const o = get().currentOrder;
        if (!o) return null;
        return { orderNo: o.orderNo, id: o.id };
      },

      clear() {
        set({ currentOrder: null, myOrders: [] });
      },
    }),
    {
      name: 'order-storage',
      version: 1,
      partialize: (state) => ({
        currentOrder:
          state.currentOrder && state.currentOrder.status < STATUS_DELIVERED
            ? state.currentOrder
            : null,
        // Keep all orders in the persisted cache so a reload doesn't
        // erase history. `fetchOrdersByUser` reconciles with backend
        // on first mount.
        myOrders: state.myOrders,
      }),
    },
  ),
);
