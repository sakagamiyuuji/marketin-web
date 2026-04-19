import api from './client.js';

/**
 * @param {Record<string, unknown>} [params] - query params (e.g. limit, category)
 */
export function getAllProducts(params) {
  return api.get('/products', { params });
}

export function getProductById(id) {
  return api.get(`/products/${id}`);
}

/**
 * Normalizes list responses: [], { data: [] }, { products: [] }
 */
export function unwrapProductList(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
}
