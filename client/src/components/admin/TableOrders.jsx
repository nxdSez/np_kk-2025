import React from "react";
import { getOrderAdmin, changeOrderAdmin } from "../../api/admin";
import { useEffect, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import { toast } from "react-toastify";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

const TableOrders = () => {
  const token = useNpStore((state) => state.token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    handleGetOrder(token);
  }, []);
  const handleGetOrder = (token) => {
    getOrderAdmin(token)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleChangeOrderStatus = (token, orderId, orderStatus) => {
    console.log(orderId, orderStatus);
    changeOrderAdmin(token, orderId, orderStatus)
      .then((res) => {
        console.log(res);
        toast.success("เปลี่ยนสถานะสำเร็จ", { position: "top-center" });
        handleGetOrder(token);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "รอตรวจสอบ":
        return "bg-red-400";
      case "ตรวจสอบแล้ว":
        return "bg-green-400";
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg max-w-5xl">
      <div>
        <table className="table-auto w-full border-gray-200 border">
          <thead>
            <tr className="bg-gray-100 rounded-md border">
              <th>ลำดับ</th>
              <th>ผู้ใช้งาน</th>
              <th>วันที่</th>
              <th>สินค้า</th>
              <th>รวม</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((item, index) => {
              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="text-center px-2 py-4">{index + 1}</td>
                  <td className="text-center">
                    <p>{item.orderedBy.email}</p>
                    <p>{item.orderedBy.address}</p>
                  </td>
                  <td className="text-center">
                    {dateFormat(item.createdAt)}
                  </td>

                  <td className="text-center">
                    {item.products?.map((product, index) => (
                      <React.Fragment key={index}>
                        <p>
                          {product.product.title}{" "}
                          <span className="text-gray-500 text-sm">
                            {numberFormat(product.product.price)} x {numberFormat(product.count)}
                          </span>
                        </p>
                      </React.Fragment>
                    ))}
                  </td>

                  <td className="text-center">
                    {numberFormat(item.cartTotal)}
                  </td>

                  <td
                    className={`text-center ${getStatusColor(
                      item.orderStatus
                    )} px-2 py-1 rounded-full`}
                  >
                    <span className="">{item.orderStatus}</span>
                  </td>

                  <td className="text-center">
                    <select
                      onChange={(e) =>
                        handleChangeOrderStatus(token, item.id, e.target.value)
                      }
                      value={item.orderStatus}
                    >
                      <option>รอตรวจสอบ</option>
                      <option>ตรวจสอบแล้ว</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOrders;