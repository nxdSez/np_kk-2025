import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/Product";
import ProductCard from "../Card/ProductCard";
import SwiperProduct from "../../utils/SwiperProduct";
import { SwiperSlide } from "swiper/react";

const NewProduct = () => {
  const [newProduct, setNewProduct] = useState([]);

  useEffect(() => {
    loadNewProduct();
  }, []);

  const loadNewProduct = async () => {
    listProductBy("createdAt", "desc", 7)
      .then((res) => {
        setNewProduct(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <SwiperProduct>
      {newProduct.map((item, index) => (
        <SwiperSlide key={index}>
          <ProductCard item={item} />
        </SwiperSlide>
      ))}
    </SwiperProduct>
  );
};

export default NewProduct;
