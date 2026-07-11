import { get } from './snake';

// GET /products  -> ProductResponse[]
// Items are { id, name, description, price, imageUrl, stock }.
export function getProducts() {
  return get('/products');
}

// GET /stations/{stationId}/products  -> per-hub catalog with stock.
export function getProductsForStation(stationId) {
  return get(`/stations/${stationId}/products`);
}