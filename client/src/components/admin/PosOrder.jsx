// client/src/pages/admin/PosOrder.jsx
import React, { useEffect, useMemo, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import {
  searchProductsAdmin,
  searchUsersAdmin,
  createManualOrderAdmin,
} from "../../api/admin";
import { toast } from "react-toastify";

// แปลงตัวเลขให้ดูง่าย (ถ้าโครงการมี util numberFormat ให้เปลี่ยนมาใช้ได้)
const nf = (n) => Number(n || 0).toLocaleString();

const PosOrder = () => {
  const token = useNpStore((s) => s.token);

  // ลูกค้า
  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // สินค้า
  const [prodQuery, setProdQuery] = useState("");
  const [prodOptions, setProdOptions] = useState([]);
  const [lines, setLines] = useState([]); // {productId,title,price,quantity}

  // อื่น ๆ
  const [status, setStatus] = useState("APPROVED"); // ขายหน้าร้าน default อนุมัติทันที
  const [saving, setSaving] = useState(false);

  // ---------- ค้นหาลูกค้า (debounce) ----------
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!token || !userQuery.trim()) return setUserOptions([]);
      try {
        const res = await searchUsersAdmin(token, userQuery.trim());
        setUserOptions(res.data || []);
      } catch (e) {
        console.log(e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [userQuery, token]);

  // ---------- ค้นหาสินค้า (debounce) ----------
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!token || !prodQuery.trim()) return setProdOptions([]);
      try {
        const res = await searchProductsAdmin(token, prodQuery.trim());
        setProdOptions(res.data || []);
      } catch (e) {
        console.log(e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [prodQuery, token]);

  // ---------- actions ----------
  const addProduct = (p) => {
    setLines((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        { productId: p.id, title: p.title, price: Number(p.price) || 0, quantity: 1 },
      ];
    });
    setProdQuery("");
    setProdOptions([]);
  };

  const changeQty = (pid, q) => {
    const qty = Math.max(1, Number(q || 1));
    setLines((prev) => prev.map((l) => (l.productId === pid ? { ...l, quantity: qty } : l)));
  };

  const removeLine = (pid) => setLines((prev) => prev.filter((l) => l.productId !== pid));

  const total = useMemo(
    () => lines.reduce((s, l) => s + Number(l.price) * Number(l.quantity), 0),
    [lines]
  );

  const canSubmit = selectedUser && lines.length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload = {
        customerId: selectedUser.id,
        status, // 'APPROVED' | 'PENDING'
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          // price: l.price, // ถ้าต้องการล็อกราคา ณ จุดขาย เปิดบรรทัดนี้ได้
        })),
      };
      const res = await createManualOrderAdmin(token, payload);
      toast.success(`สร้างออเดอร์ #${res?.data?.order?.id || ""} สำเร็จ`);

      // ล้างฟอร์ม
      setLines([]);
      setSelectedUser(null);
      setUserQuery("");
      setProdQuery("");
      setProdOptions([]);
    } catch (err) {
      console.log(err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || "สร้างออเดอร์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold">สั่งสินค้าแทนลูกค้า (Admin/Employee)</h1>

      {/* เลือกลูกค้า */}
      <div>
        <label className="font-semibold">ลูกค้า</label>
        <input
          className="border p-2 w-full rounded mt-1"
          placeholder="ค้นหาจากอีเมลหรือไอดี..."
          value={userQuery}
          onChange={(e) => {
            setUserQuery(e.target.value);
            setSelectedUser(null);
          }}
        />
        {userOptions?.length > 0 && !selectedUser && (
          <div className="border rounded mt-1 max-h-56 overflow-auto">
            {userOptions.map((u) => (
              <div
                key={u.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedUser(u);
                  setUserQuery(`${u.email} (#${u.id})`);
                  setUserOptions([]);
                }}
              >
                <div className="font-medium">{u.email}</div>
                <div className="text-sm text-gray-500">
                  ID: {u.id} {u.address ? `• ${u.address}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* เพิ่มสินค้า */}
      <div>
        <label className="font-semibold">สินค้า</label>
        <input
          className="border p-2 w-full rounded mt-1"
          placeholder="พิมพ์ชื่อสินค้า หรือ id แล้วกดเลือก"
          value={prodQuery}
          onChange={(e) => setProdQuery(e.target.value)}
        />
        {prodOptions?.length > 0 && (
          <div className="border rounded mt-1 max-h-56 overflow-auto">
            {prodOptions.map((p) => (
              <div
                key={p.id}
                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                onClick={() => addProduct(p)}
              >
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-500">ID: {p.id}</div>
                </div>
                <div className="text-right">{nf(p.price)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ตะกร้า */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">สินค้า</th>
              <th className="p-2 text-center">ราคา</th>
              <th className="p-2 text-center">จำนวน</th>
              <th className="p-2 text-right">รวม</th>
              <th className="p-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  ยังไม่มีสินค้า
                </td>
              </tr>
            )}
            {lines.map((l) => (
              <tr key={l.productId} className="border-t">
                <td className="p-2">{l.title} (#{l.productId})</td>
                <td className="p-2 text-center">{nf(l.price)}</td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min={1}
                    value={l.quantity}
                    onChange={(e) => changeQty(l.productId, e.target.value)}
                    className="w-20 border p-1 rounded text-center"
                  />
                </td>
                <td className="p-2 text-right">{nf(l.price * l.quantity)}</td>
                <td className="p-2 text-center">
                  <button className="text-red-600" onClick={() => removeLine(l.productId)}>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {lines.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50">
                <td className="p-2 font-semibold" colSpan={3}>
                  รวมทั้งสิ้น
                </td>
                <td className="p-2 text-right font-semibold">{nf(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* สถานะเริ่มต้น */}
      <div className="flex items-center gap-3">
        <label className="font-semibold">สถานะเริ่มต้น</label>
        <select
          className="border rounded p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="APPROVED">ตรวจสอบแล้ว (ขายหน้าร้าน)</option>
          <option value="PENDING">รอตรวจสอบ</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {saving ? "กำลังบันทึก..." : "สร้างออเดอร์"}
        </button>
      </div>
    </div>
  );
};

export default PosOrder;