import React from "react";
import { ListCheck } from "lucide-react";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { Link, useNavigate } from "react-router-dom";
import { userCart } from "../../api/user";
import { toast } from "react-toastify";

const ListCart = () => {
  const cart = useNpStore((s) => s.carts);
  const user = useNpStore((s) => s.user);
  const token = useNpStore((s) => s.token);
  const getTotalPrice = useNpStore((s) => s.getTotalPrice);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      await userCart(token, { cart });
      toast.success("บันทึกตะกร้าเรียบร้อย", { position: "top-center" });
      navigate("/checkout");
    } catch (err) {
      toast.warning(err?.response?.data?.message || "ไม่สามารถดำเนินการได้", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <ListCheck size={22} />
        <p className="text-lg font-semibold">
          รายการสินค้า <span className="text-gray-500">({cart.length})</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl ring-1 ring-gray-100 flex items-center gap-3">
              {item.images?.[0]?.url ? (
                <img src={item.images[0].url} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 grid place-items-center text-xs text-gray-500">No Image</div>
              )}
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-gray-500">{numberFormat(item.price)} x {item.count}</p>
              </div>
              <div className="font-semibold text-blue-600">{numberFormat(item.price * item.count)}</div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-100">
            <p className="font-semibold mb-3">ยอดรวม</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">รวมสุทธิ</span>
              <span className="text-2xl font-bold">฿{numberFormat(getTotalPrice())}</span>
            </div>

            {user ? (
              <button
                disabled={cart.length < 1}
                onClick={handleCheckout}
                className={`w-full py-2.5 rounded-xl text-white font-medium shadow-sm ${
                  cart.length < 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                สั่งซื้อ
              </button>
            ) : (
              <Link to="/login">
                <button className="w-full py-2.5 rounded-xl text-white font-medium shadow-sm bg-blue-600 hover:bg-blue-700">
                  Login
                </button>
              </Link>
            )}

            <Link to="/shop">
              <button className="mt-2 w-full py-2.5 rounded-xl font-medium ring-1 ring-gray-200 hover:bg-gray-50">
                แก้ไขรายการ
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ListCart;
