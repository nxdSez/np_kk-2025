import React from "react";
import { ShoppingCart } from "lucide-react";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ProductCard = ({ item, product }) => {
  // รองรับทั้ง item หรือ product เผื่อมีที่เรียกแบบเดิม
  const p = item ?? product ?? {};
  const actionAddtoCart = useNpStore((state) => state.actionAddtoCart);

  const imgSrc = p?.images?.[0]?.url || "/no-image.png";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* 🔧 ล็อกขนาดการ์ดให้เท่ากันทุกที่ */}
      <div
        className="border rounded-lg shadow-md p-4 bg-white
                      w-[260px] h-[320px] flex flex-col justify-between"
      >
        {/* 🔧 ล็อกกรอบรูปให้สูงเท่ากันเสมอ */}
        <div className="w-full h-40 overflow-hidden rounded-lg">
          <img
            src={imgSrc}
            alt={p?.title || "product"}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </div>

        <div className="py-2 flex-1">
          <p className="text-sm font-semibold line-clamp-2">
            {p?.title ?? "-"}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2">
            {p?.description ?? ""}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-base font-bold text-blue-600">
            {numberFormat(p?.price || 0)}
          </span>
          <button
            onClick={() => actionAddtoCart(p)}
            className="bg-blue-500 rounded-full p-2 hover:bg-blue-700 shadow-md"
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
