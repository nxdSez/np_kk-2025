import React from "react";
import { ShoppingCart } from "lucide-react";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { motion } from "framer-motion";

const ProductCard = ({ item, product }) => {
  const p = item ?? product ?? {};
  const add = useNpStore((s) => s.actionAddtoCart);
  const imgSrc = p?.images?.[0]?.url || p?.images?.[0]?.secure_url || "/no-image.png";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 w-full max-w-xs sm:max-w-[260px] h-[360px] flex flex-col overflow-hidden">
        <div className="w-full h-48 overflow-hidden">
          <img src={imgSrc} alt={p?.title || "product"} className="w-full h-full object-cover hover:scale-105 transition" />
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm font-semibold line-clamp-2">{p?.title ?? "-"}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p?.description ?? ""}</p>
        </div>
        <div className="px-4 pb-4 flex items-center justify-between">
          <span className="text-base font-bold text-blue-600">{numberFormat(p?.price || 0)}</span>
          <button onClick={() => add(p)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-sm">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default ProductCard;
