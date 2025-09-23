import React from "react";
import { ShoppingCart } from "lucide-react";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const ProductCard = ({ item }) => {
  const actionAddtoCart = useNpStore((state) => state.actionAddtoCart);
  // console.log(item)
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border rounded-lg shadow-md p-4 bg-white w-full max-w-xs mx-auto flex flex-col justify-between h-full">
        <div>
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              className="rounded-lg w-full h-40 object-cover mb-2 transition-transform duration-200 hover:scale-105"
            />
          ) : (
            <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 mb-2">
              No Image
            </div>
          )}
        </div>

        <div className="py-2">
          <p className="text-lg font-semibold truncate">{item.title}</p>
          <p className="text-sm text-gray-500 truncate">{item.description}</p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-base font-bold text-blue-600">
            {numberFormat(item.price)}
          </span>
          <button
            onClick={() => actionAddtoCart(item)}
            className="bg-blue-500 rounded-full p-2 hover:bg-blue-700 shadow-md "
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
      {" "}
    </motion.div>
  );
};

export default ProductCard;
