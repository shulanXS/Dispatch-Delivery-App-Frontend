import { create } from 'zustand';
import { products as productList } from '../mock/products';
import { categories as categoryList } from '../mock/categories';

export const useProductStore = create((set, get) => ({
  products: productList,
  categories: categoryList,
  selectedCategory: null,

  setSelectedCategory: (id) => set({ selectedCategory: id }),

  getProductsByCategory: (categoryId) => {
    const { products } = get();
    return categoryId ? products.filter((p) => p.category === categoryId) : products;
  },

  getProductById: (id) => get().products.find((p) => p.id === id),
}));
