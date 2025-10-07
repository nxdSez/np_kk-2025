// client/src/api/Product.jsx  (วางทับไฟล์เดิม)
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

// ------- Protected (ต้อง token) -------
export const createProduct = (token, form) =>
  axios.post(`${API}/product`, form, { headers: authHeaders(token) });

export const deleteProduct = (token, id) =>
  axios.delete(`${API}/product/${id}`, { headers: authHeaders(token) });

export const updateProduct = (token, id, form) =>
  axios.put(`${API}/product/${id}`, form, { headers: authHeaders(token) });

export const uploadFiles = (token, image) =>
  axios.post(`${API}/images`, { image }, { headers: authHeaders(token) });

export const removeFiles = (token, public_id) =>
  axios.post(`${API}/removeimage`, { public_id }, { headers: authHeaders(token) });

export const getMyLatestRecommendations = (
  token,
  { limit = 12, lookback = 3, inStock = true } = {}
) =>
  axios.get(`${API}/me/recommendations`, {
    params: { limit, lookback, inStock: inStock ? 1 : 0 },
    headers: authHeaders(token),
  });

// ------- Public (ไม่ต้อง token) -------
export const listProduct = (count = 20) =>
  axios.get(`${API}/products/${count}`);

// readProduct: รองรับทั้ง readProduct(id) และ readProduct(token, id) (ของเดิม)
export const readProduct = (a, b) => {
  let id, token;
  if (typeof a === "string" || typeof a === "number") {
    id = a; token = b ?? null;
  } else {
    token = a ?? null; id = b;
  }
  return axios.get(`${API}/product/${id}`, { headers: authHeaders(token) });
};

export const searchFilters = (arg) =>
  axios.post(`${API}/search/filters`, arg);

export const listProductBy = (sort, order, limit) =>
  axios.post(`${API}/productby`, { sort, order, limit });

export const getRelatedProducts = (productId, limit = 6) =>
  axios.get(`${API}/products/${productId}/related`, { params: { limit } });

export const getRelatedForMany = (ids = [], limit = 12) =>
  axios.get(`${API}/products/related`, {
    params: { ids: ids.join(","), limit },
  });
