import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Register = () => {
  //Java Script
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Password is not match!!!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5001/api/register", form);
      toast.success(res.data?.message || "Registered successfully");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Register failed";
      toast.error(errMsg);
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          สมัครสมาชิก
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleOnChange}
                name="firstName"
                type="text"
                value={form.firstName}
                placeholder="ชื่อ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                นามสกุล
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleOnChange}
                name="lastName"
                type="text"
                value={form.lastName}
                placeholder="นามสกุล"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleOnChange}
              name="email"
              type="email"
              value={form.email}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleOnChange}
              name="password"
              type="password"
              value={form.password}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleOnChange}
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition"
          >
            Register
          </button>

          <div className="text-sm text-center">
            <span className="text-gray-600">มีบัญชีแล้ว? </span>
            <Link to="/login" className="text-blue-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
