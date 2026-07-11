import { get } from './snake';

// GET /products  -> ProductResponse[]
// Items are { id, name, description, price, imageUrl, stock }.
export function getProducts() {
  return get('/products');
}

// NOTE: per-station catalog lives in stations.js as
// `getProductsForStation(stationId)` since it is a hub-scoped resource.