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

  if (loading || !items.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {items.map((p) => (
          <div key={p.id} className="min-w-[220px] bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm overflow-hidden">
            <div className="h-32 w-full bg-gray-100">
              <img src={p.images?.[0]?.url} alt={p.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="text-sm line-clamp-2 font-medium">{p.title}</div>
              <div className="text-right font-semibold text-blue-600">
                {Number(p.price || 0).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
