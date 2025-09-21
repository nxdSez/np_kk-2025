// rafce
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useNpStore from "../../store/nopporn-stores";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  // Javascript
  const navigate = useNavigate();
  const actionLogin = useNpStore((state) => state.actionLogin);
  const user = useNpStore((state) => state.user);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      const role = res.data.payload.role;
      roleRedirect(role);
      toast.success("Welcome Back");
    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.message;
      toast.error(errMsg);
    }
  };

  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black">
          เข้าสู่ระบบ
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleOnChange}
              name="email"
              type="email"
              value={form.email}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleOnChange}
              name="password"
              type="password"
              value={form.password}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition"
          >
            Login
          </button>

          <div className="text-sm text-center">
            <span className="text-gray-600">ยังไม่มีบัญชี? </span>
            <Link to="/register" className="text-blue-600 hover:underline">
              สมัครสมาชิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
