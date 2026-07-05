import { get, post } from './snake';

// GET /orders/search
// Backend derives the userId from the JWT — never trust a query param.
export function getOrdersForCurrentUser() {
  return get('/orders/search');
}

// GET /orders/{id}  -> { order, items }
export function getOrderById(id) {
  return get(`/orders/${id}`);
}

// GET /orders/{id}/tracking
export function getOrderTracking(orderId) {
  return get(`/orders/${orderId}/tracking`);
}

// POST /orders/plans  -> DeliveryPlanResponse[]
export function getDeliveryPlans(payload) {
  return post('/orders/plans', payload).then((arr) => (Array.isArray(arr) ? arr : []));
}

// POST /orders  -> { order, items }
export function createOrder(payload) {
  return post('/orders', payload);
}
