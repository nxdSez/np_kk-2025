import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/user";
import useNpStore from "../../store/nopporn-stores";
import { dateFormat } from "../../utils/dateformat";
import { numberFormat } from "../../utils/number";

const HistoryCard = () => {
  const token = useNpStore((state) => state.token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    hdlGetOrders(token);
  }, [token]);

  const hdlGetOrders = (token) => {
    getOrders(token)
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // group by paymentIntentId (fallback to order id)
  const grouped = Object.values(
    (orders || []).reduce((acc, o) => {
      const key = o.paymentIntentId || `single-${o.id}`;
      if (!acc[key]) acc[key] = { key, items: [] };
      acc[key].items.push(o);
      return acc;
    }, {})
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>
      <div className="space-y-4">
        {grouped.map((group) => {
          const items = group.items;
          const total = items.reduce((s, it) => s + Number(it.total), 0);
          const first = items[0] || {};
          const displayDate = first.updatedAt ? dateFormat(first.updatedAt) : `Order #${first.id}`;

          return (
            <div key={group.key} className="bg-gray-100 p-4 rounded-md shadow-md">
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm">Order date</p>
                  <p className="font-bold">{displayDate}</p>
                </div>
              </div>

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
                    {items.map((item, idx) => {
                      const product = item.product || {};
                      const price = product.price || 0;
                      const count = price > 0 ? Math.round(Number(item.total) / Number(price)) : 1;
                      return (
                        <tr key={idx}>
                          <td className="text-left">{product.title || "-"}</td>
                          <td className="text-center">{numberFormat(price)}</td>
                          <td className="text-center">{count}</td>
                          <td className="text-right">{numberFormat(item.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="text-right">
                  <p>ราคาสุทธิ</p>
                  <p>{numberFormat(total)}</p>
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