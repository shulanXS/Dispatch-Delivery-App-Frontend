import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addToCart: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            selected: true,
          },
        ],
      };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    })),

  toggleSelected: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, selected: !i.selected } : i
      ),
    })),

  toggleSelectAll: () =>
    set((state) => {
      const allSelected = state.items.every((i) => i.selected);
      return {
        items: state.items.map((i) => ({ ...i, selected: !allSelected })),
      };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  clearCart: () => set({ items: [] }),

  getSelectedItems: () => get().items.filter((i) => i.selected),

  getTotalPrice: () =>
    get()
      .items.filter((i) => i.selected)
      .reduce((sum, i) => sum + i.price * i.quantity, 0),

  getTotalCount: () =>
    get().items.filter((i) => i.selected).reduce((sum, i) => sum + i.quantity, 0),
}));
