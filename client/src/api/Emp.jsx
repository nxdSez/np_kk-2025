import axios from "axios";

export const getOrderEmp = async (token) => {
  return await axios.get("http://localhost:5001/api/admin/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeOrderEmp = async (token, orderId, orderStatus) => {
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