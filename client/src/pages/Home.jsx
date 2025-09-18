import React from "react";
import ContentCarousel from "../components/Home/ContentCarousel";
import BestSeller from "../components/Home/BestSeller";
import NewProduct from "../components/Home/NewProduct";

const Home = () => {
  return (
    <div>
      <ContentCarousel />
      <p className="text-xl text-center font-bold my-4">สินค้าขายดี</p>
      <BestSeller />
      <p className="text-xl text-center font-bold my-4">สินค้าใหม่</p>
      <NewProduct />
    </div>
  );
};

export default Home;
