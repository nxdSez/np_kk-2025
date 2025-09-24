import React, { useEffect, useState } from "react";
import { getOrderAdmin, changeOrderAdmin } from "../../api/admin";
import useNpStore from "../../store/nopporn-stores";
import { toast } from "react-toastify";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

// แปลงค่าจาก backend -> ฉลากภาษาไทย
const statusToLabel = (s) => {
  if (!s && s !== 0) return "-";
  const v = String(s).trim().toUpperCase();
  if (v === "APPROVED") return "ตรวจสอบแล้ว";
  return "รอตรวจสอบ"; // default = PENDING
};
// แปลงค่าจากฉลากไทย -> enum
const labelToStatus = (l) => (l === "ตรวจสอบแล้ว" ? "APPROVED" : "PENDING");

const getStatusColor = (statusLike) =>
  statusToLabel(statusLike) === "ตรวจสอบแล้ว" ? "bg-green-400" : "bg-red-400";

const TableOrders = () => {
  const token = useNpStore((s) => s.token);
  const [orders, setOrders] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (token) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await getOrderAdmin(token);
      const arr = Array.isArray(res.data) ? res.data : res.data?.orders || [];
      setOrders([...arr]); // สำเนาใหม่เสมอ
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeOrderStatus = async (orderId, newLabel) => {
    const newStatus = labelToStatus(newLabel);
    setSavingId(orderId);

    // ให้เห็นผลทันที (optimistic)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      // ✅ ฝั่ง backend ควรรับ { orderId, status }
      await changeOrderAdmin(token, orderId, newStatus);

      // ✅ ดึงรายการใหม่ “ทับ” เสมอ เพื่อให้ตรงกับจริง
      await fetchOrders();
      toast.success("เปลี่ยนสถานะสำเร็จ", { position: "top-center" });
    } catch (err) {
      console.log(err);
      // ❌ rollback ด้วยการ refetch
      await fetchOrders();
      toast.error("เปลี่ยนสถานะไม่สำเร็จ");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg max-w-5xl">
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
          {orders?.map((order, index) => {
            const customer = order.customer || order.orderedBy || {};
            const lines = order.orderItems || order.products || [];
            const created = order.createdAt || order.orderDate;
            const total =
              order.total ??
              order.cartTotal ??
              lines.reduce((s, l) => {
                const price = Number(l.price ?? l.product?.price ?? 0);
                const qty = Number(l.quantity ?? l.count ?? 1);
                return s + price * qty;
              }, 0);
            // ใช้ order.status เป็นหลัก; ถ้าไม่มี fallback เป็น order.orderStatus
            const statusLike = order.status ?? order.orderStatus;

            return (
              <tr key={order.id ?? index} className="border-b hover:bg-gray-50">
                <td className="text-center px-2 py-4">{index + 1}</td>

                <td className="text-center">
                  <p>{customer.email || "-"}</p>
                  <p>{customer.address || "-"}</p>
                </td>

                <td className="text-center">
                  {created ? dateFormat(created) : "-"}
                </td>

                <td className="text-left">
                  {(lines || []).map((l, i) => {
                    const product = l.product || {};
                    const title = product.title || "-";
                    const price = Number(l.price ?? product.price ?? 0);
                    const qty = Number(l.quantity ?? l.count ?? 1);
                    return (
                      <p key={i}>
                        {title}{" "}
                        <span className="text-gray-500 text-sm">
                          {numberFormat(price)} x {numberFormat(qty)}
                        </span>
                      </p>
                    );
                  })}
                </td>

                <td className="text-center">{numberFormat(total)}</td>

                <td className={`text-center ${getStatusColor(statusLike)} px-2 py-1 rounded-full`}>
                  <span>{statusToLabel(statusLike)}</span>
                </td>

                <td className="text-center">
                  <select
                    value={statusToLabel(statusLike)} // ให้ select ผูกกับฉลากไทย
                    disabled={savingId === order.id}
                    onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
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
  );
};

export default TableOrders;
