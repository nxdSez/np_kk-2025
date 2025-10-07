import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

const ContentCarousel = () => {
  const [images, setImages] = useState([]);
  useEffect(() => {
    axios.get("https://picsum.photos/v2/list?page=1&limit=15")
      .then((res) => setImages(res.data))
      .catch(console.log);
  }, []);

  return (
    <div className="px-4 pt-4">
      <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          className="h-52 sm:h-64 md:h-80 lg:h-96"
        >
          {images.map((img) => (
            <SwiperSlide key={img.id} className="bg-gray-100">
              <img src={img.download_url} alt={img.author} className="w-full h-full object-cover" loading="lazy" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
export default ContentCarousel;
