import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/Product";
import ProductCard from "../Card/ProductCard";
import SwiperProduct from "../../utils/SwiperProduct";
import { SwiperSlide } from "swiper/react";

const Bestseller = () => {
  const [bestseller, setBestseller] = useState([]);

  useEffect(() => {
    loadBestseller();
  }, []);

  const loadBestseller = async () => {
    listProductBy("sold", "desc", 7)
      .then((res) => {
        setBestseller(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <SwiperProduct>
      {bestseller.map((item, index) => (
        <SwiperSlide key={index} className="flex justify-center items-center">
          <ProductCard item={item} key={index} />
        </SwiperSlide>
      ))}
    </SwiperProduct>
  );
};

export default Bestseller;
