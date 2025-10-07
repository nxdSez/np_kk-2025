import React, { useEffect, useState } from "react";
import { getOrderAdmin, changeOrderAdmin } from "../../api/admin";
import { toast } from "react-toastify";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

// ====== Inline Slip Modal ======
function SlipModal({ orderId, token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);
  const [directUrl, setDirectUrl] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let revoke;
    const base = import.meta.env.VITE_API_BASE || "/api";
    const run = async () => {
      try {
        setLoading(true);
        // 1) ดึงรายละเอียด (ถ้ามี slipUrl จะได้ลิงก์ต้นฉบับ)
        const r1 = await fetch(`${base}/admin/payments/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (r1.ok) {
          const j = await r1.json();
          if (j?.payment?.slipUrl) setDirectUrl(j.payment.slipUrl);
        }
        // 2) proxy ภาพเสมอ (รองรับ private)
        const r2 = await fetch(`${base}/admin/payments/${orderId}/slip-proxy`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!r2.ok) {
          if (r2.status === 404) throw new Error("ไม่พบสลิปสำหรับออเดอร์นี้");
          throw new Error("โหลดสลิปไม่สำเร็จ");
        }
        const blob = await r2.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        revoke = () => URL.revokeObjectURL(url);
      } catch (e) {
        setErr(e.message || "โหลดสลิปไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => revoke && revoke();
  }, [orderId, token]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-4 w-[90vw] max-w-3xl shadow-xl relative">
        <button onClick={onClose} className="absolute right-2 top-2 px-3 py-1 border rounded">ปิด</button>
        <h2 className="text-lg font-semibold mb-3">สลิปออเดอร์ #{orderId}</h2>
        {loading ? (
          <div className="p-8 text-center">กำลังโหลดสลิป...</div>
        ) : err ? (
          <div className="p-8 text-center text-red-600">{err}</div>
        ) : (
          <div className="space-y-3">
            {blobUrl && (
              <div className="border rounded overflow-hidden">
                <img src={blobUrl} alt="Payment Slip" className="max-h-[70vh] w-auto mx-auto" />
              </div>
            )}
            <div className="flex gap-2">
              {directUrl && (
                <a href={directUrl} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded">
                  เปิดต้นฉบับ
                </a>
              )}
              {blobUrl && (
                <a href={blobUrl} download={`slip-order-${orderId}.jpg`} className="px-3 py-1 border rounded">
                  ดาวน์โหลด
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ====== Helpers ======
const labelFromOrderStatus = (s) => {
  const v = String(s ?? "").trim().toUpperCase();
  if (v === "APPROVED") return "ตรวจสอบแล้ว";
  if (v === "CANCELLED") return "ยกเลิก";
  return "รอตรวจสอบ";
};
const labelToOrderStatus = (l) => (l === "ตรวจสอบแล้ว" ? "APPROVED" : l === "ยกเลิก" ? "CANCELLED" : "PENDING");
const colorOf = (label) =>
  label === "ชำระแล้ว" || label === "ตรวจสอบแล้ว"
    ? "bg-green-100 text-green-700"
    : label === "สลิปถูกปฏิเสธ" || label === "ยกเลิก"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-800";

function displayStatus({ order, payment }) {
  const ps = String(payment?.status ?? "").toUpperCase();
  if (ps === "PENDING_REVIEW") return "รอตรวจสลิป";
  if (ps === "SUCCEEDED") return "ชำระแล้ว";
  if (ps === "REJECTED") return "สลิปถูกปฏิเสธ";
  return labelFromOrderStatus(order?.status);
}

export default function TableOrders() {
  const token = useNpStore((s) => s.token);
  const [orders, setOrders] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [showSlipFor, setShowSlipFor] = useState(null);

  useEffect(() => {
    if (token) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await getOrderAdmin(token);
      const arr = Array.isArray(res.data) ? res.data : res.data?.orders || [];
      setOrders([...arr]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeOrderStatus = async (orderId, thaiLabel) => {
    const toStatus = labelToOrderStatus(thaiLabel);
    setSavingId(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: toStatus } : o)));
    try {
      await changeOrderAdmin(token, orderId, toStatus);
      await fetchOrders();
      toast.success("เปลี่ยนสถานะสำเร็จ", { position: "top-center" });
    } catch (err) {
      console.log(err);
      await fetchOrders();
      toast.error("เปลี่ยนสถานะไม่สำเร็จ");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg max-w-6xl">
      <table className="table-auto w-full border-gray-200 border">
        <thead>
          <tr className="bg-gray-100 rounded-md border">
            <th>ลำดับ</th>
            <th>ผู้ใช้งาน</th>
            <th>วันที่</th>
            <th>สินค้า</th>
            <th>รวม</th>
            <th>สลิป</th>{/* ✅ คอลัมน์ใหม่ */}
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {orders?.map((order, index) => {
            const customer = order.customer || order.orderedBy || {};
            const lines = order.orderItems || order.products || [];
            const created = order.createdAt || order.orderDate;
            const payment = order.payment || null; // ถ้ามี include จะใช้ข้อมูลนี้

            const total =
              order.total ??
              order.cartTotal ??
              lines.reduce((s, l) => {
                const price = Number(l.price ?? l.product?.price ?? 0);
                const qty = Number(l.quantity ?? l.count ?? 1);
                return s + price * qty;
              }, 0);

            const statusLike = displayStatus({ order, payment });
            const ps = String(payment?.status ?? "").toUpperCase();
            const isPendingReview = ps === "PENDING_REVIEW";
            const isSucceeded = ps === "SUCCEEDED";
            const isRejected = ps === "REJECTED";

            return (
              <tr key={order.id ?? index} className="border-b hover:bg-gray-50">
                <td className="text-center px-2 py-4">{index + 1}</td>

                <td className="text-center">
                  <p>{customer.email || "-"}</p>
                  <p className="text-xs text-gray-500">{customer.name || customer.address || "-"}</p>
                </td>

                <td className="text-center">{created ? dateFormat(created) : "-"}</td>

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

                {/* ✅ คอลัมน์สลิป: แสดงปุ่มเสมอ */}
                <td className="text-center">
                  <button
                    onClick={() => setShowSlipFor(order.id)}
                    className="px-3 py-1 rounded border hover:bg-gray-50"
                  >
                    ดูสลิป
                  </button>
                </td>

                {/* สถานะรวม */}
                <td className="text-center">
                  <span className={`px-2 py-1 rounded-full text-sm inline-block ${colorOf(statusLike)}`}>
                    {statusLike}
                  </span>
                  {isSucceeded && order.status !== "APPROVED" && (
                    <div className="text-[11px] text-gray-500 mt-1">(Payment ผ่านแล้ว แต่ Order ยังไม่ APPROVED)</div>
                  )}
                </td>

                {/* จัดการ */}
                <td className="text-center">
                  <select
                    value={labelFromOrderStatus(order.status)}
                    disabled={savingId === order.id || isSucceeded || isRejected}
                    onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option>รอตรวจสอบ</option>
                    <option>ตรวจสอบแล้ว</option>
                    <option>ยกเลิก</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal พรีวิวสลิป */}
      {showSlipFor && (
        <SlipModal
          orderId={showSlipFor}
          token={useNpStore.getState().token}
          onClose={() => setShowSlipFor(null)}
        />
      )}
    </div>
  );
}
