// client/src/components/Recomendation/AssociatedGrid.jsx
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
  className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
}) {
  const token = useNpStore((s) => s.token);
  const [items, setItems] = useState(null);

  const sourceIds = useMemo(() => {
    const ids = (products || []).map((p) => p?.id).filter(Boolean);
    return [...new Set(ids)].slice(0, 8);
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (personalize && token) {
          const res = await getMyLatestRecommendations(token, {
            limit,
            lookback: 3,
            inStock: true,
          });
          if (!cancelled) setItems(res.data || []);
          return;
        }

        if (sourceIds.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }
        const res = await getRelatedForMany(sourceIds, limit);
        if (!cancelled) setItems(res.data || []);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [personalize, token, limit, sourceIds.join(",")]);

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
