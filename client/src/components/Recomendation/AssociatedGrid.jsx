import React, { useEffect, useMemo, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import {
  getRelatedForMany,
  getMyLatestRecommendations,
} from "../../api/Product";
import ProductCard from "../Card/ProductCard";
import SwiperProduct from "../../utils/SwiperProduct";
import { SwiperSlide } from "swiper/react";

export default function AssociatedGrid({
  products = [],
  limit = 7,
  personalize = false,
  inStock: inStockProp = true,
  instock,
  lookback = 5,
  onItems,
  className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
  useSwiper,
}) {
  const token = useNpStore((s) => s.token);
  const [items, setItems] = useState(null);

  // รวมค่า inStock จากสองพร็อพ (แปลงเป็น boolean ภายใน)
  const inStock =
    typeof instock !== "undefined"
      ? Boolean(instock) // 1/0, true/false ล้วนเป็น boolean ได้
      : Boolean(inStockProp);

  // จำกัดจำนวนต้นทางเพื่อไม่ให้ยิงหนัก
  const sourceIds = useMemo(() => {
    const ids = (products || []).map((p) => p?.id).filter(Boolean);
    return [...new Set(ids)].slice(0, 8);
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (personalize) {
          if (!token) {
            console.warn("[AssociatedGrid] personalize=true แต่ไม่มี token");
          } else {
            // ส่ง inStock เป็น 1/0 เสมอ
            const res = await getMyLatestRecommendations(token, {
              limit,
              lookback,
              inStock:
                typeof instock !== "undefined"
                  ? Boolean(instock)
                  : Boolean(inStockProp),
            });
            const data = Array.isArray(res.data) ? res.data : [];
            if (!cancelled) {
              setItems(data);
              if (typeof onItems === "function") onItems(data);
            }
            return;
          }
        }

        // โหมด non-personalized: ใช้ ids จาก products
        if (sourceIds.length === 0) {
          if (!cancelled) {
            setItems([]);
            if (typeof onItems === "function") onItems([]);
          }
          return;
        }
        const res = await getRelatedForMany(sourceIds, limit);
        const data = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) {
          setItems(data);
          if (typeof onItems === "function") onItems([]);
        }
      } catch (e) {
        console.error("[AssociatedGrid] fetch error:", e);
        if (!cancelled) {
          setItems([]);
          if (typeof onItems === "function") onItems([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    personalize,
    token,
    limit,
    lookback,
    inStock, // เปลี่ยนจะยิงใหม่
    inStockProp,
    sourceIds.join(","),
  ]);

  const isLoading = items === null;
  const list = Array.isArray(items) ? items : [];
  const clean = list.filter(Boolean);

  if (useSwiper) {
    return (
      <SwiperProduct>
        {clean.map((p, idx) => (
          <SwiperSlide
            key={p?.id ?? `p-${idx}`}
            className="flex justify-center items-center"
          >
            <ProductCard item={p} />
          </SwiperSlide>
        ))}
      </SwiperProduct>
    );
  }

  if (isLoading) {
    return null;
  }

  if (clean.length === 0) {
    return <p className="text-center text-sm text-gray-500">ยังไม่มีคำแนะนำ</p>;
  }

  return (
    <div className={className}>
      {clean.map((p, idx) => (
        <ProductCard key={p?.id ?? `p-${idx}`} item={p} />
      ))}
    </div>
  );
}
