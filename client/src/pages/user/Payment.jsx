// src/pages/Payment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useNpStore from "../../store/nopporn-stores";

async function api(path, { method = "GET", token, userId, body } = {}) {
  const rawStored =
    token || localStorage.getItem("token") || sessionStorage.getItem("token");
  const storedToken =
    rawStored && rawStored !== "null" && rawStored !== "undefined"
      ? rawStored
      : null;

  const isDev = import.meta.env.MODE !== "production";

  const headers = {
    "Content-Type": "application/json",
    ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
    ...(isDev && userId ? { "x-user-id": String(userId) } : {}),
  };

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    const msg = json?.error || json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export default function Payment() {
  const token = useNpStore((s) => s.token);
  const user = useNpStore((s) => s.user);
  const clearCart = useNpStore((s) => s.clearCart);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [slipUrl, setSlipUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [checkoutToken, setCheckoutToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id && !token) {
          navigate("/login");
          return;
        }
        const r = await api(`/promptpay/intent-from-cart`, {
          method: "POST",
          token,
          userId: user?.id,
        });

        const qrUrl =
          r.qrDataUrl ||
          (r.payload
            ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                r.payload
              )}`
            : "");

        setQrDataUrl(qrUrl);
        setItems(r.items || []);
        setTotal(Number(r.total || 0));
        setCheckoutToken(r.checkoutToken || "");
      } catch (e) {
        console.error(e);
        alert(`เตรียมการชำระเงินไม่สำเร็จ: ${e.message || e}`);
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  const orderTotal = useMemo(() => {
    if (typeof total === "number" && total > 0) return total;
    return (items || []).reduce(
      (s, it) =>
        s +
        Number(it.unitPrice ?? it.price ?? it.product?.price ?? 0) *
          Number(it.qty ?? it.quantity ?? it.count ?? 0),
      0
    );
  }, [items, total]);

  async function handleConfirm() {
    if (!checkoutToken) {
      alert("ไม่มีข้อมูลคำสั่งซื้อ กรุณารีเฟรชหน้าอีกครั้ง");
      return;
    }
    if (!slipUrl) {
      alert("กรุณาแนบสลิปก่อนกดปุ่มยืนยัน");
      return;
    }
    setConfirming(true);
    try {
      await api(`/promptpay/confirm`, {
        method: "POST",
        token,
        userId: user?.id,
        body: { checkoutToken, slipUrl },
      });
      clearCart?.();
      alert("ส่งสลิปแล้ว: รอแอดมินตรวจสอบ");
      navigate("/user/history");
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      alert(`ยืนยันไม่สำเร็จ: ${msg}`);
      // ✅ ถ้าโทเคนไม่ถูกต้อง/หมดอายุ ให้ย้อนกลับ 1 หน้า
      {
        navigate(-1);
      }
    } finally {
      setConfirming(false);
    }
  }

  async function uploadToCloudinary(file) {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD;
    const preset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
    if (!cloud || !preset)
      throw new Error("ยังไม่ได้ตั้งค่า Cloudinary unsigned preset");

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      {
        method: "POST",
        body: form,
      }
    );
    const json = await res.json();
    if (!json.secure_url) throw new Error("อัปโหลดสลิปล้มเหลว");
    return json.secure_url;
  }

  async function handleUploadSlip(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setSlipUrl(url);
    } catch (e2) {
      console.error(e2);
      alert("อัปโหลดสลิปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirm() {
    if (!checkoutToken) {
      alert("ไม่มีข้อมูลคำสั่งซื้อ กรุณารีเฟรชหน้าอีกครั้ง");
      return;
    }
    if (!slipUrl) {
      alert("กรุณาแนบสลิปก่อนกดปุ่มยืนยัน");
      return;
    }
    setConfirming(true);
    try {
      await api(`/promptpay/confirm`, {
        method: "POST",
        token,
        userId: user?.id,
        body: { checkoutToken, slipUrl },
      });
      clearCart?.();
      alert("ส่งสลิปแล้ว: รอแอดมินตรวจสอบ");
      navigate("/user/history");
    } catch (err) {
      console.error(err);
      alert(`ยืนยันไม่สำเร็จ: ${err.message || err}`);
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-green-50/70 dark:bg-green-900/10 text-green-700 dark:text-green-300 rounded-lg p-4 border border-green-100 dark:border-green-800/40 shadow">
          กำลังเตรียมการชำระเงิน...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* สรุปรายการ */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-200 rounded-xl border shadow p-4">
            <h2 className="text-lg font-semibold mb-2 text-green-700 dark:text-black">
              สรุปคำสั่งซื้อ
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-black border-b">
                  <th className="py-2">สินค้า</th>
                  <th className="py-2">จำนวน</th>
                  <th className="py-2">ราคา/หน่วย</th>
                  <th className="py-2">รวม</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map((it, idx) => {
                  const title = it.title ?? it.product?.title ?? "-";
                  const unit = Number(
                    it.unitPrice ?? it.price ?? it.product?.price ?? 0
                  );
                  const qty = Number(it.qty ?? it.quantity ?? it.count ?? 0);
                  return (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{title}</td>
                      <td className="py-2">{qty}</td>
                      <td className="py-2">{unit.toFixed(2)}</td>
                      <td className="py-2">{(unit * qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-right mt-3 font-semibold text-black dark:text-black">
              ยอดสุทธิ: {orderTotal.toFixed(2)} บาท
            </div>
          </div>
        </div>

        {/* PromptPay + แนบสลิป + ยืนยัน */}
        <div>
          {/* การ์ดขวา: ทำให้จางลงด้วย border/ring สีอ่อน */}
          <div className="bg-white dark:bg-gray-300 rounded-xl border border-green-100 shadow p-4 space-y-4 ring-1 ring-green-100/70">
            <h2 className="text-lg font-semibold text-green-700 dark:text-black">
              ชำระเงินด้วย PromptPay
            </h2>

            {/* กล่อง QR เบาจริง ๆ */}
            <div className="bg-green-50/60 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-800/40">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="PromptPay QR"
                  className="w-56 h-56 border border-green-100 rounded-lg mx-auto bg-white"
                />
              ) : (
                <div className="text-sm text-gray-500">กำลังสร้าง QR...</div>
              )}
            </div>

            <p className="text-xs text-green-700/80 dark:text-black text-center">
              * สแกนและโอนตามยอด จากนั้น <b>แนบสลิป</b> แล้วค่อยกดปุ่ม{" "}
              <b>ยืนยัน</b>
            </p>

            <div className="space-y-2">
              <label className="block text-sm text-green-700 dark:text-black">
                แนบสลิปโอนเงิน (.jpg/.png)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadSlip}
                disabled={uploading}
                className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md
                           file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700
                           file:cursor-pointer cursor-pointer"
              />
              {slipUrl && (
                <img
                  src={slipUrl}
                  alt="slip"
                  className="w-48 border border-green-100 rounded-md bg-white"
                />
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-md py-2 transition-colors"
            >
              {confirming ? "กำลังยืนยัน..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
