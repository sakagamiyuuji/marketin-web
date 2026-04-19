import api from './client.js';

export function getCart() {
  return api.get('/cart');
}

/**
 * @param {string} shortId
 * @param {number} [quantity]
 */
export function addCartItem(shortId, quantity = 1) {
  return api.post('/cart/items', {
    shortId,
    ...(quantity !== undefined ? { quantity } : {}),
  });
}

/**
 * @param {string} shortId
 * @param {number} quantity
 */
export function updateCartItem(shortId, quantity) {
  return api.put(`/cart/items/${encodeURIComponent(shortId)}`, { quantity });
}

/**
 * @param {string} shortId
 */
export function removeCartItem(shortId) {
  return api.delete(`/cart/items/${encodeURIComponent(shortId)}`);
}

export function clearCart() {
  return api.delete('/cart');
}
