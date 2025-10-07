import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/Product";
import ProductCard from "../Card/ProductCard";
import SwiperProduct from "../../utils/SwiperProduct";
import { SwiperSlide } from "swiper/react";

const Bestseller = () => {
  const [bestseller, setBestseller] = useState([]);

  useEffect(() => {
    listProductBy("sold", "desc", 7)
      .then((res) => setBestseller(res.data))
      .catch(console.log);
  }, []);

  if (!bestseller.length) return null;

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl font-semibold">สินค้าขายดี</h2>
      </div>
      <SwiperProduct>
        {bestseller.map((item, index) => (
          <SwiperSlide key={index} className="flex justify-center">
            <ProductCard item={item} />
          </SwiperSlide>
        ))}
      </SwiperProduct>
    </section>
  );
};

export default Bestseller;
