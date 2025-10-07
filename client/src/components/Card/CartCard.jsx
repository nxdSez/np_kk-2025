import React from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { numberFormat } from "../../utils/number";
import useNpStore from "../../store/nopporn-stores";

const CartCard = () => {
  const carts = useNpStore((s) => s.carts);
  const updateQty = useNpStore((s) => s.actionUpdateQuantity);
  const removeItem = useNpStore((s) => s.actionRemoveProduct);
  const getTotalPrice = useNpStore((s) => s.getTotalPrice);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ตะกร้าสินค้า</h1>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
        {carts.length === 0 && (
          <div className="text-center text-gray-500 py-10">ยังไม่มีสินค้าในตะกร้า</div>
        )}

        <div className="space-y-3">
          {carts.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl ring-1 ring-gray-100 bg-white flex items-center gap-4"
            >
              {item.images?.length ? (
                <img
                  src={item.images[0].url}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 grid place-items-center text-xs text-gray-500">
                  No Image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.id, Math.max(1, item.count - 1))}
                  className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{item.count}</span>
                <button
                  onClick={() => updateQty(item.id, item.count + 1)}
                  className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="w-24 text-right font-semibold text-blue-600">
                {numberFormat(item.price * item.count)}
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-rose-600 p-2 hover:bg-rose-50 rounded-lg"
                title="ลบ"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Total + CTA */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">รวม</div>
          <div className="text-xl font-bold">{numberFormat(getTotalPrice())}</div>
        </div>

        <Link to="/cart">
          <button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl shadow-sm">
            ดำเนินการชำระเงิน
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CartCard;
