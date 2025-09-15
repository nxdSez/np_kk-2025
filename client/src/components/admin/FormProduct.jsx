import React, { useEffect, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import { createProduct, deleteProduct } from "../../api/Product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { Link } from "react-router-dom";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

const initialState = {
  title: "title",
  description: "description",
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const FormProduct = () => {
  const token = useNpStore((state) => state.token);
  const categories = useNpStore((state) => state.categories);
  const products = useNpStore((state) => state.products);
  const getCategory = useNpStore((state) => state.getCategory);
  const getProduct = useNpStore((state) => state.getProduct);
  // console.log(products);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
    images: [],
  });

  useEffect(() => {
    getCategory();
    getProduct(100);
  }, []);

  const handleOnChange = (e) => {
    // console.log(e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error("กรุณาเลือกหมวดหมู่สินค้า");
      return;
    }
    try {
      const res = await createProduct(token, form);
      // console.log("Product created:", res.data);
      setForm(initialState); // Reset form after submission
      getProduct();
      toast.success("Product created successfully");
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await deleteProduct(token, id);
        getProduct(s);
        toast.success("Product deleted successfully");
      } catch (err) {
        console.error("Error deleting product:", err);
        // toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg max-w-5xl">
      <form onSubmit={handleSubmit} className="my-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">
          เพิ่มข้อมูลสินค้า
        </h1>
        <input
          className="border p-2 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          name="title"
          placeholder="ชื่อสินค้า"
          value={form.title}
          onChange={handleOnChange}
        />
        <input
          className="border p-2 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          name="description"
          placeholder="คำอธิบายสินค้า"
          value={form.description}
          onChange={handleOnChange}
        />
        <div className="flex gap-4">
          <input
            className="border p-2 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            name="price"
            placeholder="ราคา"
            value={form.price}
            onChange={handleOnChange}
          />
          <input
            className="border p-2 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            name="quantity"
            placeholder="จำนวนสินค้า"
            value={form.quantity}
            onChange={handleOnChange}
          />
        </div>
        <select
          className="border p-2 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        <Uploadfile form={form} setForm={setForm} />

        <button
          className="bg-blue-500 hover:bg-blue-700 transition-colors text-white p-2 rounded w-full font-semibold shadow"
          type="submit"
        >
          <span className="text-white">เพิ่มสินค้า</span>
        </button>
      </form>
      <hr className="my-6" />
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-blue-100 text-blue-800">
              <th scope="col" className="p-2">
                No.
              </th>
              <th scope="col" className="p-2">
                รูปสินค้า
              </th>
              <th scope="col" className="p-2">
                ชื่อสินค้า
              </th>
              <th scope="col" className="p-2">
                รายละเอียด
              </th>
              <th scope="col" className="p-2">
                ราคา
              </th>
              <th scope="col" className="p-2">
                จำนวนสินค้า
              </th>
              <th scope="col" className="p-2">
                จำนวนสินค้าที่ขาย
              </th>
              <th scope="col" className="p-2">
                วันที่อัปเดต
              </th>
              <th scope="col" className="p-2">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 align-middle">
            {products.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-blue-100 even:bg-blue-50 transition-colors border-b"
              >
                <th scope="row" className="text-center">
                  {index + 1}
                </th>
                <td className="text-center">
                  {item.images.length > 0 ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg shadow-md mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 mx-auto">
                      ไม่มีรูปภาพ
                    </div>
                  )}
                </td>
                <td className="text-center">{item.title}</td>
                <td className="text-center">{item.description}</td>
                <td className="text-center">{numberFormat(item.price)}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">{item.sold}</td>
                <td className="text-xs text-gray-500">{dateFormat(item.updatedAt)}</td>
                <td>
                  <div className="flex flex-col gap-2 items-center">
                    <Link
                      to={"/admin/product/" + item.id}
                      className="text-blue-600 hover:underline"
                    >
                      แก้ไข
                    </Link>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(item.id)}
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormProduct;
