import { get } from './snake';

// GET /test/stations  -> Station[]
// Note: position comes back as WKT ("POINT(lng lat)"); consumers can pass it
// to a GIS helper if they need lat/lng as numbers.
export function getStations() {
  return get('/test/stations');
}

export function getStation(id) {
  return get(`/test/stations/${id}`);
}

// GET /stations/{stationId}/products  -> per-hub catalog.
export function getProductsForStation(stationId) {
  return get(`/stations/${stationId}/products`);
}