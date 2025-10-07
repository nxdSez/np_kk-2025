import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/Product";
import ProductCard from "../Card/ProductCard";
import SwiperProduct from "../../utils/SwiperProduct";
import { SwiperSlide } from "swiper/react";

const NewProduct = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listProductBy("createdAt", "desc", 7)
      .then((res) => setItems(res.data))
      .catch(console.log);
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl font-semibold">สินค้าใหม่</h2>
      </div>
      <SwiperProduct>
        {items.map((item, index) => (
          <SwiperSlide key={index} className="flex justify-center">
            <ProductCard item={item} />
          </SwiperSlide>
        ))}
      </SwiperProduct>
    </section>
  );
};

export default NewProduct;
