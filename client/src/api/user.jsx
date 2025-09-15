import axios from "axios";

export const userCart = async (token, cart) => {
  return await axios.post("http://localhost:5001/api/user/cart", cart, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getUserCart = async (token) => {
  return await axios.get("http://localhost:5001/api/user/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const saveAddress = async (token,address) => {
  return await axios.post("http://localhost:5001/api/user/address", {address}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const saveOrder = async (token, payload) => {
  return await axios.post("http://localhost:5001/api/user/order", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getOrders = async (token) => {
  return await axios.get("http://localhost:5001/api/user/order",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};