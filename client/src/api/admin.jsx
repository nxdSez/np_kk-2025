import axios from "axios";
const API = "http://localhost:5001/api";

const cfg = (token, extra = {}) => ({
  headers: { Authorization: `Bearer ${token}` },
  ...extra,
});

export const getOrderAdmin = async (token) => {
  return await axios.get("http://localhost:5001/api/admin/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const changeOrderAdmin = async (token, orderId, status) => {
  return await axios.put(
    "http://localhost:5001/api/admin/order-status",
    { orderId, status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getListAllUsers = async (token) => {
  return await axios.get("http://localhost:5001/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserStatus = async (token, value) => {
  return await axios.post("http://localhost:5001/api/change-status", value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserRole = async (token, value) => {
  return await axios.post("http://localhost:5001/api/change-role", value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const searchProductsAdmin = (token, q) =>
  axios.get(`${API}/admin/search-products`, cfg(token, { params: { q } }));

export const searchUsersAdmin = (token, q) =>
  axios.get(`${API}/admin/search-users`, cfg(token, { params: { q } }));

export const createManualOrderAdmin = (token, payload) =>
  axios.post(`${API}/admin/manual-orders`, payload, cfg(token));

export const listAssoc = (token) =>
  axios.get(`${API}/admin/assoc`, cfg(token));

export const createAssocApi = (token, payload) =>
  axios.post(`${API}/admin/assoc`, payload, cfg(token));

export const updateAssocApi = (token, id, payload) =>
  axios.put(`${API}/admin/assoc/${id}`, payload, cfg(token));

export const deleteAssocApi = (token, id) =>
  axios.delete(`${API}/admin/assoc/${id}`, cfg(token));
