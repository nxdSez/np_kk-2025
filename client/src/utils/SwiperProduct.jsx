import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Autoplay, Navigation } from "swiper/modules";

const SwiperProduct = ({ children }) => {
  return (
    <Swiper
      slidesPerView={5}
      spaceBetween={10}
      pagination={true}
      navigation={true}
      modules={[Pagination, Autoplay, Navigation]}
      className="object-cover rounded-md mt-4"
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 5,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 40,
          },
        }}
    >
      {children}
    </Swiper>
  );
};

export default SwiperProduct;
