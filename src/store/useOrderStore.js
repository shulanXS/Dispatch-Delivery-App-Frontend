import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set, get) => ({
      currentOrder: null,
      orders: [],

      createOrder: (orderData) => {
        const order = {
          orderId: `ORD${Date.now()}`,
          status: "confirmed",
          createTime: new Date().toISOString(),
          ...orderData,
        };
        set((state) => ({
          currentOrder: order,
          orders: [...state.orders, order],
        }));
        return order;
      },

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status } : o,
          ),
          currentOrder:
            state.currentOrder?.orderId === orderId
              ? { ...state.currentOrder, status }
              : state.currentOrder,
        })),

      getOrderById: (id) => get().orders.find((o) => o.orderId === id),
    }),
    {
      name: "order-storage",
    },
  ),
);
