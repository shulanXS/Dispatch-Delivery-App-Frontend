import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart entries shape consumed by CartItem / CartPage:
//   { productId, name, price, image, quantity, selected }
// Image is sourced from the backend's imageUrl on addToCart.
//
// Backend note: there is no /cart API yet. Until the backend exposes
// one, we persist the cart in localStorage. The `apiBackend` flag is
// a switch that future code can flip to true without touching any
// page (just swap the setter implementations).

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // Hook reserved for future backend-backed cart. When enabled,
      // mutating actions should also POST to /cart; pages do not need
      // to change.
      apiBackend: { enabled: false },

      addToCart: (product) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
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
                image: product.imageUrl || product.image || '',
                stock: product.stock ?? null,
                quantity: 1,
                selected: true,
              },
            ],
          };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        })),

      toggleSelected: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.quantity > 0
              ? { ...i, selected: !i.selected }
              : i,
          ),
        })),

      toggleSelectAll: () =>
        set((state) => {
          const activeItems = state.items.filter((i) => i.quantity > 0);
          const allSelected =
            activeItems.length > 0 && activeItems.every((i) => i.selected);
          return {
            items: state.items.map((i) =>
              i.quantity > 0 ? { ...i, selected: !allSelected } : i,
            ),
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      clearCart: () => set({ items: [] }),

      cleanupZeroItems: () =>
        set((state) => ({
          items: state.items.filter((i) => i.quantity > 0),
        })),

      getActiveItems: () => get().items.filter((i) => i.quantity > 0),

      getSelectedItems: () =>
        get().items.filter((i) => i.selected && i.quantity > 0),

      getTotalPrice: () =>
        get()
          .items.filter((i) => i.selected && i.quantity > 0)
          .reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotalCount: () =>
        get()
          .items.filter((i) => i.selected && i.quantity > 0)
          .reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart-storage',
    },
  ),
);