import { useEffect, useState } from "react";
import { getMyLatestRecommendations } from "../api/Product";
import useNpStore from "../store/nopporn-stores";

const nf = (n) => Number(n || 0).toLocaleString();

export default function LatestOrderRecommendations({
  limit = 8,
  title = "สินค้าแนะนำสำหรับคุณ",
}) {
  const token = useNpStore((s) => s.token);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!token) return;
    getMyLatestRecommendations(token, { limit, inStock: true })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, [token, limit]);

  if (!token || items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-3">
        {items.map((p) => (
          <div key={p.id} className="border rounded p-2">
            <img
              src={p.images?.[0]?.url}
              alt={p.title}
              className="w-full h-32 object-cover"
            />
            <div className="mt-2 text-sm line-clamp-2">{p.title}</div>
            <div className="text-right font-medium">{nf(p.price)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}