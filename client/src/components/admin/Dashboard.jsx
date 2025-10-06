import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import useNpStore from "../../store/nopporn-stores"; // ✅ ใช้ Zustand เพื่อดึง token และ user

export default function Dashboard() {
  const { token, user } = useNpStore(); // ✅ ดึงข้อมูลผู้ใช้และ token
  const [summary, setSummary] = useState({});
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  // ✅ ตั้งค่าเริ่มต้นช่วงวันที่ (เดือนปัจจุบัน)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .substring(0, 10);
  const lastDay = new Date(today).toISOString().substring(0, 10);
  const [range, setRange] = useState({ from: firstDay, to: lastDay });

  const API = "http://localhost:5001/api/admin"; // ✅ ตรวจสอบให้ตรงกับพอร์ต backend ของคุณ

  // ✅ โหลดข้อมูลจาก Backend จริง (Prisma → Supabase)
  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const loadData = async () => {
      try {
        const [sum, day, month] = await Promise.all([
          axios.get(`${API}/sales/summary`, { params: range, headers }),
          axios.get(`${API}/sales/daily`, { params: range, headers }),
          axios.get(`${API}/sales/monthly`, { params: { year }, headers }),
        ]);

        setSummary(sum.data);
        setDaily(day.data);
        setMonthly(month.data);
      } catch (err) {
        console.error("❌ โหลดข้อมูลไม่สำเร็จ:", err);
      }
    };

    if (token) {
      loadData(); // ✅ โหลดเฉพาะเมื่อมี token จริง
    }
  }, [range, year, token]);

  // ✅ ตัวเลือกการแสดงผลกราฟ
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "กราฟยอดขาย" },
    },
  };

  // ✅ ตรวจสิทธิ์ผู้ใช้ (เฉพาะ admin)
  if (user?.role !== "admin" && user?.role !== "employee") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">
          ⛔ ไม่มีสิทธิ์เข้าหน้านี้
        </h1>
        <p>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">
        📊 แดชบอร์ดแอดมิน
      </h1>

      {/* 🔹 ตัวเลือกช่วงวันที่ */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label>จากวันที่: </label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="border rounded p-1 ml-2"
          />
        </div>
        <div>
          <label>ถึงวันที่: </label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="border rounded p-1 ml-2"
          />
        </div>
        <div>
          <label>ปี: </label>
          <select
            className="border p-1 rounded ml-2"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 การ์ดยอดขายรวม */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2>ยอดขายรวม</h2>
          <p className="text-3xl font-bold text-blue-700">
            {Number(summary.totalSales || 0).toLocaleString()} ฿
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2>จำนวนคำสั่งซื้อ</h2>
          <p className="text-3xl font-bold text-green-700">
            {summary.totalOrders || 0}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2>ปี</h2>
          <p className="text-3xl font-bold text-yellow-700">{year}</p>
        </div>
      </div>

      {/* 🔹 กราฟรายวัน */}
      <div>
        <h2 className="font-semibold mt-4 mb-2">ยอดขายรายวัน</h2>
        <Line
          data={{
            labels: daily.map((r) => r.day),
            datasets: [
              {
                label: "ยอดขาย (บาท)",
                data: daily.map((r) => r.totalSales),
                borderColor: "blue",
                backgroundColor: "rgba(59,130,246,0.3)",
              },
            ],
          }}
          options={options}
        />
      </div>

      {/* 🔹 กราฟรายเดือน */}
      <div>
        <h2 className="font-semibold mt-4 mb-2">ยอดขายรายเดือน</h2>
        <Bar
          data={{
            labels: monthly.map((r) => r.month),
            datasets: [
              {
                label: "ยอดขาย (บาท)",
                data: monthly.map((r) => r.totalSales),
                backgroundColor: "orange",
              },
            ],
          }}
          options={options}
        />
      </div>
    </div>
  );
}
