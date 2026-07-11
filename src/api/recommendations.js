import { post } from './snake';

// POST /recommendations  body { query }
// Backend returns { summary, items: [{ productId, quantity, reason, product }] }.
//
// Auth: requires a valid JWT (route is gated by SecurityConfig.anyRequest().authenticated()).
// Backend behavior: when OPENAI_API_KEY is set, hits OpenAI; otherwise falls back to a
// keyword-matching client built on the product catalog, so the UI works offline-friendly.
export function getRecommendations(query) {
  return post('/recommendations', { query });
}