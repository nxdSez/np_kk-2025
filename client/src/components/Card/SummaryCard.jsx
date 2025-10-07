import React, { useEffect, useMemo, useState } from "react";
import { getUserCart, saveAddress } from "../../api/user";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SummaryCard = () => {
  const token = useNpStore((state) => state.token);
  const [products, setProducts] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [address, setAddress] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ค่าจัดส่ง/ส่วนลด (ถ้ามีระบบภายหลัง ค่อยผูกกับ backend)
  const shippingFee = 0;
  const discount = 0;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getUserCart(token)
      .then((res) => {
        setProducts(res?.data?.products || []);
        setServerTotal(res?.data?.cartTotal ?? 0);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [token]);

  // คำนวณ total จากรายการ (กันกรณี backend ไม่ส่งหรือไม่ตรง)
  const computedItemsTotal = useMemo(() => {
    return (products || []).reduce((sum, item) => {
      const price = Number(item?.product?.price || 0);
      const count = Number(item?.count || 0);
      return sum + price * count;
    }, 0);
  }, [products]);

  // เลือก total ที่น่าเชื่อถือที่สุด
  const cartTotal = serverTotal > 0 ? serverTotal : computedItemsTotal;
  const grandTotal = Math.max(cartTotal + shippingFee - discount, 0);

  const handleSaveAddress = () => {
    if (!address.trim()) {
      toast.error("กรุณากรอกที่อยู่ในการจัดส่ง", { position: "top-center" });
      return;
    }
    saveAddress(token, address.trim())
      .then((res) => {
        setAddressSaved(true);
        toast.success(res?.data?.message || "บันทึกที่อยู่เรียบร้อย", {
          position: "top-center",
        });
      })
      .catch((err) => {
        console.log("Error saving address:", err);
        toast.error("บันทึกที่อยู่ไม่สำเร็จ", { position: "top-center" });
      });
  };

  const handleToPayment = () => {
    if (!addressSaved) {
      toast.error("กรุณาบันทึกที่อยู่ในการจัดส่งก่อน", {
        position: "top-center",
      });
      return;
    }
    navigate("/user/payment");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Address */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">ที่อยู่ในการจัดส่ง</h2>
          {addressSaved && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
              บันทึกแล้ว
            </span>
          )}
        </div>

        <div className="px-5 py-5">
          <label htmlFor="shipping-address" className="sr-only">
            ที่อยู่ในการจัดส่ง
          </label>
          <textarea
            id="shipping-address"
            onChange={(e) => {
              setAddress(e.target.value);
              if (addressSaved) setAddressSaved(false);
            }}
            className="w-full min-h-32 resize-y rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 px-4 py-3 text-sm placeholder:text-gray-400"
            placeholder="กรุณากรอกที่อยู่ในการจัดส่ง (บ้านเลขที่, ถนน, ตำบล/อำเภอ, จังหวัด, รหัสไปรษณีย์, เบอร์โทร)"
            defaultValue=""
          />

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleSaveAddress}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition"
            >
              <span>บันทึกที่อยู่</span>
            </button>
            {!addressSaved && (
              <p className="text-sm text-gray-500">
                ต้องบันทึกที่อยู่ก่อนจึงจะไปขั้นตอนชำระเงินได้
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Summary */}
      <div className="lg:sticky lg:top-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold">สรุปคำสั่งซื้อ</h2>
          </div>

          {/* Items */}
          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products?.length ? (
              <ul className="divide-y divide-gray-100">
                {products.map((item, idx) => {
                  const title = item?.product?.title || "ไม่มีชื่อสินค้า";
                  const price = Number(item?.product?.price || 0);
                  const count = Number(item?.count || 0);
                  const line = price * count;
                  return (
                    <li key={idx} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{title}</p>
                          <p className="text-xs text-gray-500">
                            จำนวน : {count} × {numberFormat(price)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {numberFormat(line)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">ไม่มีสินค้าในตะกร้า</div>
            )}
          </div>

          {/* Totals */}
          <div className="px-5 pb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ยอดรวมสินค้า</span>
                <span className="font-medium">{numberFormat(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ค่าจัดส่ง</span>
                <span className="font-medium">{numberFormat(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ส่วนลด</span>
                <span className="font-medium">-{numberFormat(discount)}</span>
              </div>
            </div>

            <hr className="my-3" />

            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold">ยอดชำระทั้งหมด</span>
              <span className="text-2xl font-bold">
                {numberFormat(grandTotal)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  บาท
                </span>
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pb-5">
            <button
              onClick={handleToPayment}
              disabled={!addressSaved || products.length === 0}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium shadow-sm transition
                ${!addressSaved || products.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              {(!addressSaved || products.length === 0) ? "กรุณาบันทึกที่อยู่ก่อน" : "ดำเนินการชำระเงิน"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              * เมื่อกดไปหน้า “ชำระเงิน” คุณจะสามารถอัปโหลดสลิปและยืนยันการชำระได้
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
