import React, { useEffect, useMemo, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import {
  getRelatedForMany,
  getMyLatestRecommendations,
} from "../../api/Product";
import ProductCard from "../Card/ProductCard";

export default function AssociatedGrid({
  products = [],
  limit = 12,
  personalize = false,
  // รับทั้งสองแบบ เพื่อกันสะกดไม่ตรง
  inStock: inStockProp = true,
  instock, // เผื่อคุณส่ง instock={1}
  lookback = 3,
  className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
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
            console.warn(
              "[AssociatedGrid] personalize=true แต่ไม่มี token → จะไม่เรียก /me/recommendations"
            );
          } else {
            // ส่ง inStock เป็น 1/0 เสมอ
            const res = await getMyLatestRecommendations(token, {
              limit,
              lookback,
              inStock, // ใน API function จะ map เป็น 1/0 ให้อีกชั้น
            });
            if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
            return;
          }
        }

        // โหมด non-personalized: ใช้ ids จาก products
        if (sourceIds.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }
        const res = await getRelatedForMany(sourceIds, limit);
        if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("[AssociatedGrid] fetch error:", e);
        if (!cancelled) setItems([]);
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
    sourceIds.join(","),
  ]);

  const list = items && items.length > 0 ? items : products || [];
  const clean = list.filter(Boolean);

  return (
    <div className={className}>
      {clean.map((p, idx) => (
        <ProductCard key={p?.id ?? `p-${idx}`} item={p} />
      ))}
    </div>
  );
}
