import React, { useEffect, useState } from "react";
import { getOrders } from "../../api/user";
import useNpStore from "../../store/nopporn-stores";
import { dateFormat } from "../../utils/dateformat";
import { numberFormat } from "../../utils/number";

const statusMeta = (raw) => {
  const s = String(raw || "").toUpperCase().trim();
  if (["PENDING", "PINEDING", "WAITING", "WAITING_PAYMENT", "QUEUE"].some(k => s.includes(k)))
    return { text: "รอชำระ/ตรวจสลิป", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" };
  if (["REVIEW", "VERIFY"].some(k => s.includes(k)))
    return { text: "รอตรวจสอบ", cls: "bg-sky-100 text-sky-700 ring-1 ring-sky-200" };
  if (["APPROVED", "PAID", "SUCCESS", "COMPLETED"].some(k => s.includes(k)))
    return { text: "ชำระสำเร็จ", cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" };
  if (["SHIPPED", "DELIVERED"].some(k => s.includes(k)))
    return { text: "จัดส่งแล้ว", cls: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" };
  if (["CANCEL", "CANCELED", "CANCELLED", "VOID"].some(k => s.includes(k)))
    return { text: "ยกเลิก", cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200" };
  return { text: s || "ไม่ทราบสถานะ", cls: "bg-gray-100 text-gray-700 ring-1 ring-gray-200" };
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

const HistoryCard = () => {
  const token = useNpStore((s) => s.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getOrders(token)
      .then((res) => setOrders(res?.data?.orders || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [token]);

  if (!loading && (!orders || orders.length === 0)) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
        <h1 className="text-2xl font-semibold mb-2">ประวัติการสั่งซื้อ</h1>
        <p className="text-gray-500">ยังไม่มีคำสั่งซื้อของคุณ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
              <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
              <div className="h-10 bg-gray-100 rounded mb-4" />
              <div className="h-32 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading &&
        orders.map((order) => {
          const items = order?.orderItems || [];
          const computedTotal =
            items.reduce((s, it) => s + Number(it?.price || 0) * Number(it?.quantity || 0), 0) ||
            Number(order?.total) ||
            0;
          const sm = statusMeta(order?.status);

          return (
            <section key={order.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
              {/* Header */}
              <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-gray-50 to-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-100 grid place-items-center ring-1 ring-gray-200">
                    <span className="text-lg">🧾</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sm.cls}`}>{sm.text}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order?.updatedAt ? dateFormat(order.updatedAt) : "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-right">
                  <Row label="จำนวนรายการ" value={`${items.length} รายการ`} />
                  <Row label="ยอดสุทธิ" value={`${numberFormat(computedTotal)} บาท`} />
                  {order?.paymentMethod && <Row label="ช่องทางชำระ" value={order.paymentMethod} />}
                </div>
              </header>

              {/* Items: table on md+, stacked list on mobile */}
              <div className="px-4 pb-4">
                {/* Mobile list */}
                <ul className="md:hidden divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <li className="px-3 py-6 text-center text-gray-500">ไม่พบรายการสินค้า</li>
                  ) : (
                    items.map((it, idx) => {
                      const title = it?.product?.title || "-";
                      const price = Number(it?.price) || 0;
                      const qty = Number(it?.quantity) || 0;
                      const lineTotal = price * qty;
                      return (
                        <li key={idx} className="py-3 px-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-2">{title}</p>
                              <p className="text-xs text-gray-500">{numberFormat(price)} × {qty}</p>
                            </div>
                            <div className="text-sm font-semibold">{numberFormat(lineTotal)}</div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>

                {/* Table for md+ */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="text-sm text-gray-600">
                        <th className="text-left font-medium bg-gray-50 px-3 py-2 rounded-l-lg ring-1 ring-gray-100">สินค้า</th>
                        <th className="text-center font-medium bg-gray-50 px-3 py-2 ring-1 ring-gray-100">ราคา</th>
                        <th className="text-center font-medium bg-gray-50 px-3 py-2 ring-1 ring-gray-100">จำนวน</th>
                        <th className="text-right font-medium bg-gray-50 px-3 py-2 rounded-r-lg ring-1 ring-gray-100">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-gray-500">ไม่พบรายการสินค้าในออเดอร์นี้</td>
                        </tr>
                      ) : (
                        items.map((it, idx) => {
                          const title = it?.product?.title || "-";
                          const price = Number(it?.price) || 0;
                          const qty = Number(it?.quantity) || 0;
                          const lineTotal = price * qty;
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-3 text-sm">{title}</td>
                              <td className="px-3 py-3 text-sm text-center">{numberFormat(price)}</td>
                              <td className="px-3 py-3 text-sm text-center">{qty}</td>
                              <td className="px-3 py-3 text-sm text-right font-medium">{numberFormat(lineTotal)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer total */}
                <div className="mt-4 flex flex-col items-end gap-1">
                  <div className="text-sm text-gray-500">ยอดชำระรวม</div>
                  <div className="text-2xl font-semibold">
                    {numberFormat(computedTotal)} <span className="text-base font-normal text-gray-500">บาท</span>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
    </div>
  );
};

export default HistoryCard
