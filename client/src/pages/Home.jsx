import React, { useEffect } from "react";
import ContentCarousel from "../components/Home/ContentCarousel";
import BestSeller from "../components/Home/BestSeller";
import NewProduct from "../components/Home/NewProduct";
import AssociatedGrid from "../components/Recomendation/AssociatedGrid";
import useNpStore from "../../src/store/nopporn-stores";

const Home = () => {
  const getProduct = useNpStore((s) => s.getProduct);
  const products = useNpStore((s) => s.products);

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  return (
    <div>
      <ContentCarousel />

      {/* แทนกริดเดิมด้วย AssociatedGrid (ถ้าไม่มีของเชื่อม จะ fallback เป็น products เดิม) */}
      <p className="text-xl text-center font-bold my-4">แนะนำสินค้าสำหรับคุณ</p>
      <AssociatedGrid
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center"
        products={products}
      />

      <p className="text-xl text-center font-bold my-4">สินค้าขายดี</p>
      <BestSeller />

      <p className="text-xl text-center font-bold my-4">สินค้าใหม่</p>
      <NewProduct />
    </div>
  );
};

export default Home;
