import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/user";
import useNpStore from "../../store/nopporn-stores";
import { dateFormat } from "../../utils/dateformat";
import { numberFormat } from "../../utils/number";

const HistoryCard = () => {
  const token = useNpStore((state) => state.token);
  // console.log(token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // code
    hdlGetOrders(token);
  }, []);

  const hdlGetOrders = (token) => {
    getOrders(token)
      .then((res) => {
        // console.log(res);
        setOrders(res.data.orders);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Processed":
        return "bg-gray-200";
      case "Processing":
        return "bg-blue-200";
      case "Shipped":
        return "bg-yellow-200";
      case "Delivered":
        return "bg-green-200";
      case "Cancelled":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>
      {/* คลุม */}
      <div className="space-y-4">
        {/* Card Loop Order*/}
        {orders?.map((item, index) => {
          // console.log(item)
          return (
            <div key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
              {/* ทีมงาน header */}
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm">Order date</p>
                  <p className="font-bold">{dateFormat(item.updatedAt)}</p>
                </div>
                <div>
                  <span className={`${getStatusColor(item.orderStatus)} 
                  px-2 py-1 rounded-full`}>
                    {item.orderStatus}
                  </span>
                </div>
              </div>
              {/* ทีมงาน table Loop Product*/}
              <div>
                <table className="border w-full px-4 py-4">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="text-left">สินค้า</th>
                      <th className="text-center">ราคา</th>
                      <th className="text-center">จำนวน</th>
                      <th className="text-right">รวม</th>
                    </tr>
                  </thead>

                  <tbody>
                    {item.products?.map((product, index) => {
                      // console.log(product);
                      return (
                        <tr key={index}>
                          <td className="text-left">{product.product.title}</td>
                          <td className="text-center">{numberFormat(product.product.price)}</td>
                          <td className="text-center">{product.count}</td>
                          <td className="text-right">
                            {numberFormat(
                              product.count * product.product.price
                            )}{" "}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* ทีมงาน Total */}
              <div>
                <div className="text-right">
                  <p>ราคาสุทธิ</p>
                  <p>{numberFormat(item.cartTotal)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryCard;