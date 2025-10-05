import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Autoplay, Navigation, Scrollbar } from "swiper/modules";

const SwiperProduct = ({ children }) => {
  return (
    <Swiper
      slidesPerView={6}
      spaceBetween={10}
      // pagination={true}
      navigation={true}
      grid={{
        rows: 6,
      }}
      scrollbar={{
        hide: true
      }}
      modules={[Pagination, Autoplay, Navigation ,Scrollbar]}
      className="mySwiper object-cover rounded-md mt-4"
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      }}
      onSwiper={(Swiper) =>{
        if (Swiper?.autoplay?.running === false) {
          Swiper.autoplay.start()
        }
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
