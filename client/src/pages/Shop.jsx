import React, { useEffect } from "react";
import ProductCard from "../components/Card/ProductCard";
import useNpStore from "../../src/store/nopporn-stores";
import SearchCard from "../components/Card/SearchCard";
import CartCard from "../components/Card/CartCard";

const Shop = () => {
  const getProduct = useNpStore((state) => state.getProduct);
  const products = useNpStore((state) => state.products);

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div className="flex">
      {/* //Search bar */}
      <div className="w-1/4 p-4 bg-gray-100 h-screen ">
        <SearchCard />
      </div>

      {/* //Product list */}
      <div className="w-3/4 p-4 h-screen overflow-y-auto">
        <p className="text-2xl font-bold mb-4"> สินค้าทั้งหมด</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-wrap">
          {/* Product Card */}
          {products.map((item, index) => (
            <ProductCard key={index} item={item} />
          ))}
        </div>
      </div>
      {/* //Cart */}
      <div className="w-1/4 p-4 bg-gray-100 h-screen overflow-auto">
        <CartCard />
      </div>
    </div>
  );
};

export default Shop;