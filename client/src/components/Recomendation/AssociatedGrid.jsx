// client/src/components/AssociatedGrid.jsx
import React, { useEffect, useMemo, useState } from "react";
// ⛏️ แก้ชื่อไฟล์ api ให้เป็นตัวพิมพ์เล็กตามจริง
import { getRelatedForMany } from "../../api/Product";
import ProductCard from "../Card/ProductCard";

export default function AssociatedGrid({
  products = [],
  limit = 12,
  className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center"
}) {
  const [items, setItems] = useState(null);

const sourceIds = useMemo(() => {
  const ids = (products || []).map((p) => p?.id).filter(Boolean);
  return ids.slice(0, 5); // เอาแค่ 5 ตัวแรกพอ
}, [products]);

  useEffect(() => {
    if (!sourceIds.length) { setItems([]); return; }
    getRelatedForMany(sourceIds, limit)
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, [sourceIds.join(","), limit]);

  // ถ้าได้ "สินค้าที่เชื่อมกัน" → ใช้อันนั้น; ไม่งั้นใช้ชุดเดิม
  const listToRender = ((items && items.length > 0) ? items : products) || [];
  const clean = listToRender.filter(Boolean);

  return (
    <div className={className}>
      {clean.map((p, idx) => (
        // ⛏️ ส่งเป็น item เพื่อให้ตรงกับ ProductCard
        <ProductCard key={p?.id ?? `p-${idx}`} item={p} />
      ))}
    </div>
  );
}
