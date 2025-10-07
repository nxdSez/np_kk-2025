import { useEffect, useState } from 'react';
import { fetchSlipBlob, getPaymentDetail } from '../services/adminPaymentApi';

export default function SlipModal({ orderId, token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [objectUrl, setObjectUrl] = useState(null);
  const [directUrl, setDirectUrl] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let revoke;
    const run = async () => {
      try {
        setLoading(true);
        // ขอรายละเอียดก่อน เผื่อ slipUrl เป็น public จะเปิดตรงได้
        const { payment } = await getPaymentDetail(orderId, token);
        if (payment?.slipUrl) setDirectUrl(payment.slipUrl);

        // ลองโหลดผ่าน proxy เสมอ (ครอบคลุมกรณี private)
        const blob = await fetchSlipBlob(orderId, token);
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        revoke = () => URL.revokeObjectURL(url);
      } catch (e) {
        setErr('โหลดสลิปไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => { revoke && revoke(); };
  }, [orderId, token]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-4 w-[90vw] max-w-3xl shadow-xl relative">
        <button onClick={onClose} className="absolute right-2 top-2 px-3 py-1 border rounded">ปิด</button>
        <h2 className="text-lg font-semibold mb-3">สลิปออเดอร์ #{orderId}</h2>

        {loading ? (
          <div className="p-8 text-center">กำลังโหลดสลิป...</div>
        ) : err ? (
          <div className="p-8 text-center text-red-600">{err}</div>
        ) : (
          <div className="space-y-3">
            {/* แสดงจาก proxy (เชื่อถือได้เสมอ) */}
            {objectUrl && (
              <div className="border rounded overflow-hidden">
                <img src={objectUrl} alt="Payment Slip" className="max-h-[70vh] w-auto mx-auto" />
              </div>
            )}

            <div className="flex gap-2">
              {directUrl && (
                <a href={directUrl} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded">
                  เปิดต้นฉบับ (แท็บใหม่)
                </a>
              )}
              {objectUrl && (
                <a href={objectUrl} download={`slip-order-${orderId}.jpg`} className="px-3 py-1 border rounded">
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
