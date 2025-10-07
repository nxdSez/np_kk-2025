import React, { useEffect, useState } from "react";
import useNpStore from "../../store/nopporn-stores";

const SearchCard = () => {
  const getProduct = useNpStore((s) => s.getProduct);
  const categories = useNpStore((s) => s.categories);
  const getCategory = useNpStore((s) => s.getCategory);
  const search = useNpStore((s) => s.actionSearchFilters);

  const [text, setText] = useState("");
  const [categorySelected, setCategorySelected] = useState([]);

  useEffect(() => { getCategory(); }, []);

  useEffect(() => {
    const t = setTimeout(() => (text ? search({ query: text }) : getProduct()), 300);
    return () => clearTimeout(t);
  }, [text]);

  const toggleCat = (id) => {
    const next = categorySelected.includes(id)
      ? categorySelected.filter((c) => c !== id)
      : [...categorySelected, id];
    setCategorySelected(next);
    next.length ? search({ category: next }) : getProduct();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-3">ค้นหาสินค้า</h2>
      <input
        onChange={(e) => setText(e.target.value)}
        type="text"
        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
        placeholder="ค้นหาสินค้า..."
      />
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">หมวดหมู่</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = categorySelected.includes(String(c.id));
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(String(c.id))}
                className={`px-3 py-1.5 rounded-full text-sm ring-1 transition ${
                  active
                    ? "bg-blue-600 text-white ring-blue-600"
                    : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default SearchCard;
