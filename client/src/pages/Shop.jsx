import React, { useEffect, useMemo, useState } from "react";
import useNpStore from "../../src/store/nopporn-stores";
import SearchCard from "../components/Card/SearchCard";
import CartCard from "../components/Card/CartCard";
import AssociatedGrid from "../components/Recomendation/AssociatedGrid";
import ProductCard from "../components/Card/ProductCard";

const Shop = () => {
  const getProduct = useNpStore((state) => state.getProduct);
  const products = useNpStore((state) => state.products);

  const [recIds, setRecIds] = useState(new Set());

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  const allWithoutRec = useMemo(() => {
    if (!products) return [];
    if (!(recIds instanceof Set)) return products;
    return products.filter((p) => !recIds.has(p?.id));
  }, [products, recIds]);

  return (
    <div className="flex">
      {/* Search bar */}
      <div className="w-1/4 p-4 bg-gray-100 h-screen ">
        <SearchCard />
      </div>

      {/* Product list */}
      <div className="w-3/4 p-4 h-screen overflow-y-auto">
        <p className="text-2xl font-bold mb-4 text-center">
          สินค้าแนะนำสำหรับคุณ
        </p>
        <AssociatedGrid
          products={products || []}
          instock={true}
          lookback={5}
          personalize
          limit={12}
          className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-2 gap-y-2"
          onItems={(arr) => setRecIds(new Set((arr || []).map((p) => p?.id)))}
        />
        <p className="text-2xl font-bold my-4 text-center">สินค้าทั้งหมด</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-2 gap-y-2">
          {(products || []).map((p, idx) => (
            <ProductCard key={p?.id ?? `all-${idx}`} item={p} />
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-1/4 p-4 bg-gray-100 h-screen overflow-auto">
        <CartCard />
      </div>
    </div>
  );
};

export default Shop;
