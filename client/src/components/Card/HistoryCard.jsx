import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/user";
import useNpStore from "../../store/nopporn-stores";
import { dateFormat } from "../../utils/dateformat";
import { numberFormat } from "../../utils/number";

// const HistoryCard = () => {
//   const token = useNpStore((state) => state.token);
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     hdlGetOrders(token);
//   }, [token]);

//   const hdlGetOrders = (token) => {
//     getOrders(token)
//       .then((res) => {
//         setOrders(res.data.orders || []);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   // group by paymentIntentId (fallback to order id)
//   const grouped = Object.values(
//     (orders || []).reduce((acc, o) => {
//       const key = o.paymentIntentId || `single-${o.id}`;
//       if (!acc[key]) acc[key] = { key, items: [] };
//       acc[key].items.push(o);
//       return acc;
//     }, {})
//   );

//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>
//       <div className="space-y-4">
//         {grouped.map((group) => {
//           const items = group.items;
//           const total = items.reduce((s, it) => s + Number(it.total), 0);
//           const first = items[0] || {};
//           const displayDate = first.updatedAt ? dateFormat(first.updatedAt) : `Order #${first.id}`;

//           return (
//             <div key={group.key} className="bg-gray-100 p-4 rounded-md shadow-md">
//               <div className="flex justify-between mb-2">
//                 <div>
//                   <p className="text-sm">Order date</p>
//                   <p className="font-bold">{displayDate}</p>
//                 </div>
//               </div>

//               <div>
//                 <table className="border w-full px-4 py-4">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="text-left">สินค้า</th>
//                       <th className="text-center">ราคา</th>
//                       <th className="text-center">จำนวน</th>
//                       <th className="text-right">รวม</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {items.map((item, idx) => {
//                       const product = item.product || {};
//                       const price = product.price || 0;
//                       const count = price > 0 ? Math.round(Number(item.total) / Number(price)) : 1;
//                       return (
//                         <tr key={idx}>
//                           <td className="text-left">{product.title || "-"}</td>
//                           <td className="text-center">{numberFormat(price)}</td>
//                           <td className="text-center">{count}</td>
//                           <td className="text-right">{numberFormat(item.total)}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div>
//                 <div className="text-right">
//                   <p>ราคาสุทธิ</p>
//                   <p>{numberFormat(total)}</p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

const HistoryCard = () => {
  const token = useNpStore((state) => state.token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;
    getOrders(token)
      .then((res) => {
        // Back-end: { ok:true, orders:[ { orderItems:[...], total, updatedAt, ... } ] }
        setOrders(res?.data?.orders || []);
      })
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const items = order.orderItems || [];
          // บางกรณีอยากคำนวณใหม่จาก items แทนใช้ order.total
          const computedTotal =
            items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0) ||
            Number(order.total) ||
            0;

          return (
            <div key={order.id} className="bg-gray-100 p-4 rounded-md shadow-md">
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm">Order #{order.id}</p>
                  <p className="font-bold">
                    {order.updatedAt ? dateFormat(order.updatedAt) : "-"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="border w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="text-left p-2">สินค้า</th>
                      <th className="text-center p-2">ราคา</th>
                      <th className="text-center p-2">จำนวน</th>
                      <th className="text-right p-2">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-gray-500">
                          ไม่พบรายการสินค้าในออเดอร์นี้
                        </td>
                      </tr>
                    )}

                    {items.map((it, idx) => {
                      const title = it?.product?.title || "-";
                      const price = Number(it?.price) || 0;
                      const qty = Number(it?.quantity) || 0;
                      const lineTotal = price * qty;

                      return (
                        <tr key={idx} className="border-t">
                          <td className="p-2 text-left">{title}</td>
                          <td className="p-2 text-center">{numberFormat(price)}</td>
                          <td className="p-2 text-center">{qty}</td>
                          <td className="p-2 text-right">{numberFormat(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">ราคาสุทธิ</p>
                  <p className="text-lg font-semibold">{numberFormat(computedTotal)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {(!orders || orders.length === 0) && (
          <div className="text-gray-500">ยังไม่มีประวัติการสั่งซื้อ</div>
        )}
      </div>
    </div>
  );
};

export default HistoryCard;