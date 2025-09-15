import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";
import 'swiper/css/navigation';

import { Pagination, Autoplay, Navigation } from "swiper/modules";

const ContentCarousel = () => {

  const [images, setImages] = useState([]);

  useEffect(() => {
    hdlGetImage();
  }, []);

  const hdlGetImage = () => {
    axios.get("https://picsum.photos/v2/list?page=1&limit=15")
    .then((res)=> setImages(res.data))
    .catch((err) => console.log(err));
  };

  return (
    <div className="w-full px-4 py-4 ">
      <Swiper
        pagination={true}
        modules={[Pagination, Autoplay]}
        className="mySwiper h-64 md:h-96 object-cover rounded-md"
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
      >
        {
          images?.map((item, index)=>
            <SwiperSlide key={index} className="flex justify-center items-center">

              <img src={item.download_url} alt={item.author} />
            </SwiperSlide>
          )
        }
      </Swiper>
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
      >
        {
          images?.map((item, index)=>
            <SwiperSlide key={index} className="flex justify-center items-center">

              <img src={item.download_url} alt={item.author} />
            </SwiperSlide>
          )
        }
      </Swiper>
    </div>
  );
};

export default ContentCarousel;
