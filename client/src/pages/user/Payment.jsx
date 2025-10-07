import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useNpStore from "../../store/nopporn-stores";

// helper เรียก API (อาศัย proxy Vite ให้ยิง /api มายัง backend)
async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Payment() {
  const token = useNpStore((s) => s.token);
  const clearCart = useNpStore((s) => s.clearCart);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [slipUrl, setSlipUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // snapshot จาก cart (ยังไม่ลง DB)
  const [items, setItems] = useState([]); // [{productId,title,unitPrice,qty}]
  const [total, setTotal] = useState(0);  // บาท (Float)
  const [checkoutToken, setCheckoutToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }
        // ขอ QR + snapshot จากตะกร้า (ไม่สร้าง order/DB)
        const r = await api(`/promptpay/intent-from-cart`, {
          method: "POST",
          token,
        });
        setQrDataUrl(r.qrDataUrl);
        setItems(r.items || []);
        setTotal(Number(r.total || 0));
        setCheckoutToken(r.checkoutToken || "");
      } catch (e) {
        console.error(e);
        alert("เตรียมการชำระเงินไม่สำเร็จ");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const orderTotal = useMemo(() => {
    if (typeof total === "number" && total > 0) return total;
    return (items || []).reduce((s, it) => s + Number(it.unitPrice || 0) * Number(it.qty || 0), 0);
  }, [items, total]);

  // อัปโหลดสลิปขึ้น Cloudinary (unsigned)
  async function uploadToCloudinary(file) {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD;
    const preset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
    if (!cloud || !preset) throw new Error("ยังไม่ได้ตั้งค่า Cloudinary unsigned preset");

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: "POST",
      body: form,
    });
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
        body: { checkoutToken, slipUrl },
      });
      clearCart?.();
      alert("ส่งสลิปแล้ว: รอแอดมินตรวจสอบ");
      // ถ้าต้องการพาไปหน้าประวัติ ให้เปิดบรรทัดล่างนี้
      navigate("/user/history");
    } catch (err) {
      console.error(err);
      alert("ยืนยันไม่สำเร็จ");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gray-100 rounded-lg p-4 border shadow">กำลังเตรียมการชำระเงิน...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* สรุปรายการ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow p-4">
            <h2 className="text-lg font-semibold mb-2">สรุปคำสั่งซื้อ</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">สินค้า</th>
                  <th className="py-2">จำนวน</th>
                  <th className="py-2">ราคา/หน่วย</th>
                  <th className="py-2">รวม</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map((it, idx) => {
                  const title = it.title ?? it.product?.title ?? "-";
                  const unit = Number(it.unitPrice ?? it.price ?? it.product?.price ?? 0);
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
            <div className="text-right mt-3 font-semibold">
              ยอดสุทธิ: {orderTotal.toFixed(2)} บาท
            </div>
          </div>
        </div>

        {/* PromptPay + แนบสลิป + ยืนยัน */}
        <div>
          <div className="bg-white rounded-xl border shadow p-4 space-y-4">
            <h2 className="text-lg font-semibold">ชำระเงินด้วย PromptPay</h2>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="PromptPay QR" className="w-56 h-56 border rounded-lg mx-auto" />
            ) : (
              <div className="text-sm text-gray-500">กำลังสร้าง QR...</div>
            )}

            <p className="text-xs text-gray-500 text-center">
              * สแกนและโอนตามยอด จากนั้น <b>แนบสลิป</b> แล้วค่อยกดปุ่ม <b>ยืนยัน</b>
            </p>

            <div className="space-y-2">
              <label className="block text-sm">แนบสลิปโอนเงิน (.jpg/.png)</label>
              <input type="file" accept="image/*" onChange={handleUploadSlip} disabled={uploading} />
              {slipUrl && <img src={slipUrl} alt="slip" className="w-48 border rounded-md" />}
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-md py-2"
            >
              {confirming ? "กำลังยืนยัน..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
