import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5001/api";

export default function RelatedProductsSection({ productId, limit = 6, title = "สินค้าแนะนำ" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    axios
      .get(`${API}/products/${productId}/related`, { params: { limit } })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [productId, limit]);

  if (loading) return null;
  if (!items.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex gap-4 mt-4 overflow-x-auto h-full">
        {items.map((p) => (
          <div key={p.id} className="border rounded p-2">
            <img
              src={p.images?.[0]?.url}
              alt={p.title}
              className="w-full h-32 object-cover"
            />
            <div className="mt-2 text-sm line-clamp-2">{p.title}</div>
            <div className="text-right font-medium">
              {Number(p.price || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
