import React, { useState, useEffect, use } from "react";
import useNpStore from "../../store/nopporn-stores";
import {
  createCategory,
  removeCategory,
} from "../../api/Category";
import { toast } from "react-toastify";

const FormCategory = () => {
  // JS
  const token = useNpStore((state) => state.token);
  const [name, setName] = useState("");
  // const [categories, setCategories] = useState([]);

  const categories = useNpStore((state) => state.categories);
  const getCategory = useNpStore((state) => state.getCategory);

  useEffect(() => {
    getCategory(token);
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return toast.warning("Please enter a category name");
    }
    console.log(token, name);
    try {
      const res = await createCategory(token, { name });
      console.log(res.data.name);
      toast.success(`Category created successfully`);
      getCategory(token);
    } catch (err) {
      console.error("Error creating category:", err);
    }
  };
  const handleRemove = async (id) => {
    console.log("Removing category with ID:", id);
    try {
      const res = await removeCategory(token, id);
      getCategory(token);
      console.log("Category removed:", res.data);
      toast.success("Category removed successfully");
    } catch (err) {
      console.error("Error removing category:", err);
      toast.error("Failed to remove category");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <h1>Category Management</h1>
      <form className="my-4" onSubmit={handleSubmit}>
        <input
          onChange={(e) => setName(e.target.value)}
          className="=border p-2 rounded w-full mb-4 bg-gray-100"
          type="text"
        />
        <button
          className="bg-blue-500 text-white p-2 rounded w-full"
          type="submit"
        >
          Add Category
        </button>
      </form>

      <hr />
      <ul className="list-none">
        {categories.map((item, index) => (
          <li key={index} className="flex justify-between p-2 border-b">
            <span>{item.name}</span>
            <button
              onClick={() => handleRemove(item.id)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormCategory;
