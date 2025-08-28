import React, { useEffect, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const SearchCard = () => {
  const getProduct = useNpStore((state) => state.getProduct);
  const products = useNpStore((state) => state.products);
  const actionSearchFilters = useNpStore((state) => state.actionSearchFilters);

  const getCategory = useNpStore((state) => state.getCategory);
  const categories = useNpStore((state) => state.categories);

  const [text, setText] = useState("");
  const [categorySelected, setCategorySelected] = useState([]);

  useEffect(() => {
    getCategory();
  }, []);

  // Search By Text
  useEffect(() => {
    const delay = setTimeout(() => {
      if (text) {
        actionSearchFilters({ query: text });
      } else {
        getProduct();
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [text]);

  // Search By Category

  const handleCheck = (e) => {
    console.log(e.target.value);
    const inCheck = e.target.value;
    const inState = [...categorySelected];
    const findCheck = inState.indexOf(inCheck);

    if (findCheck === -1) {
      inState.push(inCheck);
    } else {
      inState.splice(findCheck, 1);
    }
    setCategorySelected(inState);

    actionSearchFilters({ category: inState });
    if (inState.length > 0) {
      actionSearchFilters({ category: inState });
    } else {
      getProduct();
    }
  };
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ค้นหาสินค้า</h1>
      {/* Search By Text */}
      <input
        onChange={(e) => setText(e.target.value)}
        type="text"
        className="border rounded-md w-full mb-4 px-2"
        placeholder="ค้นหาสินค้า..."
      />
      <hr />
      {/* Search By Category */}
      <div>
        <h1>หมวดหมู่สินค้า</h1>

        <div>
          {categories.map((item, index) => (
            <div key={item.id} className=" flex gap-2">
              <input type="checkbox" value={item.id} onChange={handleCheck} />
              <label htmlFor={`cat-${item.id}`}>{item.name}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchCard;
