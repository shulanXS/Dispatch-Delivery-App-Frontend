import { create } from 'zustand';
import * as productsApi from '../api/products';
import * as stationsApi from '../api/stations';
import { categories } from '../mock/categories';
import { inferCategory } from '../data/categoryKeywords';

// Notes:
// - The backend Product entity has no `category` field, so the category
//   grid in the UI is powered by the static `mock/categories` list.
// - Each category card navigates to the universal product browse view.
// - For category browsing we use `/stations/{id}/products` (with stock)
//   once a station is selected, so the UI shows real per-hub inventory.
// - `getProductsByCategory(categoryId)` does a soft match using keyword
//   heuristics from `categoryKeywords.js`.

export const useProductStore = create((set, get) => ({
  products: [],
  categories,
  loading: false,
  error: null,
  selectedCategory: null,

  stations: [],
  stationsLoading: false,
  stationsError: null,
  selectedStationId: null,

  stationProducts: [],
  stationProductsLoading: false,
  stationProductsError: null,

  setSelectedCategory: (id) => set({ selectedCategory: id }),
  setSelectedStation: (id) => set({ selectedStationId: id }),

  async fetchProducts() {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const list = await productsApi.getProducts();
      set({ products: list, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  async fetchStations() {
    if (get().stationsLoading) return;
    set({ stationsLoading: true, stationsError: null });
    try {
      const list = await stationsApi.getStations();
      set({
        stations: list || [],
        stationsLoading: false,
        selectedStationId:
          get().selectedStationId || (list && list[0] ? list[0].id : null),
      });
    } catch (err) {
      set({
        stationsError:
          err.response?.data?.message || err.message || '加载站点失败',
        stationsLoading: false,
      });
    }
  },

  async fetchProductsForStation(stationId) {
    if (!stationId) return;
    set({
      stationProductsLoading: true,
      stationProductsError: null,
    });
    try {
      const list = await stationsApi.getProductsForStation(stationId);
      set({
        stationProducts: list || [],
        stationProductsLoading: false,
      });
    } catch (err) {
      set({
        stationProductsError:
          err.response?.data?.message ||
          err.message ||
          '加载该站点商品失败',
        stationProductsLoading: false,
      });
    }
  },

  // Soft-categorize the current station catalog (or the global catalog).
  getProductsByCategory: (categoryId) => {
    const source =
      get().stationProducts.length > 0
        ? get().stationProducts
        : get().products;
    if (!categoryId || categoryId === 'all') return source;
    return source.filter((p) => inferCategory(p) === categoryId);
  },

  getProductById: (id) => {
    const all = [
      ...get().stationProducts,
      ...get().products.filter(
        (p) => !get().stationProducts.some((sp) => sp.id === p.id),
      ),
    ];
    return all.find((p) => p.id === id);
  },
}));