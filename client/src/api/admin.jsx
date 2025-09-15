import axios from "axios";

export const getOrderAdmin = async (token) => {
  return await axios.get("http://localhost:5001/api/admin/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const changeOrderAdmin = async (token, orderId, orderStatus) => {
  return await axios.put(
    "http://localhost:5001/api/admin/order-status",
    { orderId, orderStatus },
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