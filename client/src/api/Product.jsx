import axios from "axios";

const API = "http://localhost:5001/api";

const cfg = (token, extra = {}) => ({
  headers: { Authorization: `Bearer ${token}` },
  ...extra,
});

export const createProduct = async (token, form) => {
  return await axios.post("http://localhost:5001/api/product", form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const listProduct = async (count = 20) => {
  return await axios.get("http://localhost:5001/api/products/" + count);
};

export const readProduct = async (token, id) => {
  return await axios.get("http://localhost:5001/api/product/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteProduct = async (token, id) => {
  return await axios.delete("http://localhost:5001/api/product/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProduct = async (token, id, form) => {
  return await axios.put("http://localhost:5001/api/product/" + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const uploadFiles = async (token, form) => {
  return await axios.post(
    "http://localhost:5001/api/images",
    {
      image: form,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const removeFiles = async (token, public_id) => {
  return await axios.post(
    "http://localhost:5001/api/removeimage",
    {
      public_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getMyLatestRecommendations = (
  token,
  { limit = 12, lookback = 3, inStock = true } = {}
) => {
  const inStockParam = inStock ? 1 : 0; // ← สำคัญ
  return axios.get(`${API}/me/recommendations`, {
    params: { limit, lookback, inStock: inStockParam },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const searchFilters = async (arg) => {
  return await axios.post("http://localhost:5001/api/search/filters", arg);
};

export const listProductBy = async (sort, order, limit) => {
  return await axios.post("http://localhost:5001/api/productby", {
    sort,
    order,
    limit,
  });
};

export const getRelatedProducts = (productId, limit = 6) =>
  axios.get(`${API}/products/${productId}/related`, { params: { limit } });

export const getRelatedForMany = (ids = [], limit = 12) =>
  axios.get(`${API}/products/related`, {
    params: { ids: ids.join(","), limit },
  });
