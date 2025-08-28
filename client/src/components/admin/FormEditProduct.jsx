import React, { useEffect, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import { createProduct, readProduct, listProduct, updateProduct } from "../../api/Product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { useParams, useNavigate } from "react-router-dom";

const initialState = {
  title: "title",
  description: "description",
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const FormEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useNpStore((state) => state.token);
  const categories = useNpStore((state) => state.categories);
  const getCategory = useNpStore((state) => state.getCategory);
  // console.log(products);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: "",
    images: [],
  });

  useEffect(() => {
    getCategory();
    fetchProduct(token, id, form);
  }, []);

  const fetchProduct = async (token, id, form) => {
    try {
      const res = await readProduct(token, id, form);
      setForm(res.data);
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };
  console.log("form", form);

  const handleOnChange = (e) => {
    console.log(e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error("กรุณาเลือกหมวดหมู่สินค้า");
      return;
    }
    try {
      const res = await updateProduct(token, id, form);
      // console.log("Product created:", res.data);
      setForm(initialState); // Reset form after submission
      toast.success("Product created successfully");
      navigate("/admin/product");
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <form onSubmit={handleSubmit} className="my-4">
        <h1>แก้ไขข้อมูลสินค้า</h1>
        <input
          className="border p-2 rounded w-full mb-4 bg-gray-100"
          type="text"
          name="title"
          placeholder="ชื่อสินค้า"
          value={form.title}
          onChange={handleOnChange}
        />
        <input
          className="border p-2 rounded w-full mb-4 bg-gray-100"
          type="text"
          name="description"
          placeholder="คำอธิบายสินค้า"
          value={form.description}
          onChange={handleOnChange}
        />
        <input
          className="border p-2 rounded w-full mb-4 bg-gray-100"
          type="number"
          name="price"
          placeholder="ราคา"
          value={form.price}
          onChange={handleOnChange}
        />
        <input
          className="border p-2 rounded w-full mb-4 bg-gray-100"
          type="number"
          name="quantity"
          placeholder="จำนวนสินค้า"
          value={form.quantity}
          onChange={handleOnChange}
        />
        <select
          className="border p-2 rounded w-full mb-4 bg-gray-100"
          name="categoryId"
          value={form.categoryId}
          onChange={handleOnChange}
        >
          <option value="" disabled>
            เลือกหมวดหมู่
          </option>
          {categories.map((item, index) => (
            <option key={index} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <hr />
        <Uploadfile form={form} setForm={setForm} />

        <button
          className="bg-blue-500 text-white p-2 rounded w-full mb-4"
          type="submit"
        >
          <span className="text-white">แก้ไขสินค้า</span>
        </button>
        <hr />
        <br />
      </form>
    </div>
  );
};

export default FormEditProduct;
