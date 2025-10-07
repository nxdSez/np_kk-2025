// client/src/pages/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import useNpStore from "../../store/nopporn-stores";

export default function Dashboard() {
  const { token, user } = useNpStore();
  const API = "http://localhost:5001/api/admin";

  // วันที่เริ่ม-สิ้นสุดของเดือนปัจจุบัน
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .substring(0, 10);
  const lastDay = new Date(today).toISOString().substring(0, 10);

  const [range, setRange] = useState({ from: firstDay, to: lastDay });
  const [year, setYear] = useState(today.getFullYear());

  // ข้อมูลเดิม
  const [summary, setSummary] = useState({});
  const [monthly, setMonthly] = useState([]);

  // ใหม่: ยอดขายรายวันตามสินค้า (ใช้กับกราฟบน)
  const [byProduct, setByProduct] = useState([]); // [{ productId, productName, sold, revenue }]
  const [metric, setMetric] = useState("sold");   // "sold" | "revenue"

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const [sum, month, byProd] = await Promise.all([
          axios.get(`${API}/sales/summary`, { params: range, headers }),
          axios.get(`${API}/sales/monthly`, { params: { year }, headers }),
          axios.get(`${API}/sales/by-product`, { params: range, headers }),
        ]);

        setSummary(sum.data || {});
        setMonthly(month.data || []);
        setByProduct(byProd.data || []);
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
      }
    })();
  }, [token, range.from, range.to, year]);

  // ---------- กราฟบน: Top 10 สินค้า ----------
  const TOP_N = 10;
  const topByProduct = useMemo(() => {
    const sorted = [...byProduct].sort((a, b) => {
      const A = metric === "sold" ? Number(a.sold || 0) : Number(a.revenue || 0);
      const B = metric === "sold" ? Number(b.sold || 0) : Number(b.revenue || 0);
      return B - A;
    });
    return sorted.slice(0, TOP_N);
  }, [byProduct, metric]);

  const byProductBarData = useMemo(() => {
    const labels = topByProduct.map(p => p.productName || `#${p.productId}`);
    const values = topByProduct.map(p =>
      metric === "sold" ? Number(p.sold || 0) : Number(p.revenue || 0)
    );

    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: metric === "sold" ? "จำนวนขาย (ชิ้น)" : "รายได้ (บาท)",
          data: values,
          backgroundColor:
            metric === "sold" ? "rgba(37,99,235,0.20)" : "rgba(16,185,129,0.20)",
          borderColor: metric === "sold" ? "rgb(37,99,235)" : "rgb(16,185,129)",
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 14, // ผอม ๆ เหมือนแท่งเทียน
          maxBarThickness: 18,
          borderSkipped: false,
        },
      ],
    };
  }, [topByProduct, metric]);

  const byProductBarOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: `กราฟยอดขายรายวันตามสินค้า (Top ${TOP_N})` },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              metric === "sold"
                ? `ขายได้ ${ctx.parsed.y.toLocaleString()} ชิ้น`
                : `รายได้ ${ctx.parsed.y.toLocaleString()} บาท`,
          },
        },
      },
      scales: {
        x: {
          ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: metric === "sold" ? "ชิ้น" : "บาท" },
        },
      },
    }),
    [metric]
  );

  // ---------- กราฟล่าง: ยอดขายรายเดือน (บาท) แบบแท่ง ----------
  const monthlyBarData = useMemo(() => {
    return {
      labels: monthly.map((r) => r.month),
      datasets: [
        {
          type: "bar",
          label: "ยอดขายรายเดือน (บาท)",
          data: monthly.map((r) => Number(r.totalSales || 0)),
          backgroundColor: "rgba(37,99,235,0.20)",
          borderColor: "rgb(37,99,235)",
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 24,
          maxBarThickness: 28,
          borderSkipped: false,
        },
      ],
    };
  }, [monthly]);

  const monthlyBarOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "ยอดขายรายเดือน (บาท)" },
        tooltip: {
          callbacks: {
            label: (ctx) => `฿ ${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: { ticks: { autoSkip: false } },
        y: {
          beginAtZero: true,
          title: { display: true, text: "บาท" },
        },
      },
    }),
    []
  );

  if (user?.role !== "admin" && user?.role !== "employee") {
    return <div className="p-6">ต้องเป็นผู้มีสิทธิ์ (Admin/Employee) เท่านั้น</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow">
      {/* ฟิลเตอร์ช่วงวันที่ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="font-bold text-xl">แดชบอร์ดแอดมิน</div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-slate-600">จากวันที่:</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="px-2 py-1 rounded border"
          />
          <label className="text-sm text-slate-600">ถึงวันที่:</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="px-2 py-1 rounded border"
          />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-2 py-1 rounded border"
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const y = today.getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* การ์ดสรุป */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="text-slate-600 text-sm">ยอดรวม</div>
          <div className="text-3xl font-extrabold text-blue-700">
            {(summary?.totalSales || 0).toLocaleString()} ฿
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="text-slate-600 text-sm">จำนวนคำสั่งซื้อ</div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {(summary?.orderCount || 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <div className="text-slate-600 text-sm">ปี</div>
          <div className="text-3xl font-extrabold text-amber-700">{year}</div>
        </div>
      </div>

      {/* กราฟบน: Top 10 ตามสินค้า (แท่งเทียนผอม ๆ) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">ยอดขายรายวันตามสินค้า (Top 10)</h2>
          <div className="flex gap-1 text-sm">
            <button
              onClick={() => setMetric("sold")}
              className={`px-3 py-1 rounded-l-md border ${metric === "sold" ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              จำนวนขาย (ชิ้น)
            </button>
            <button
              onClick={() => setMetric("revenue")}
              className={`px-3 py-1 rounded-r-md border ${metric === "revenue" ? "bg-emerald-600 text-white" : "bg-white"}`}
            >
              รายได้ (บาท)
            </button>
          </div>
        </div>

        <div className="h-[380px]">
          <Bar data={byProductBarData} options={byProductBarOptions} />
        </div>
        {byProduct.length === 0 && (
          <div className="text-sm text-slate-500 mt-2">
            ไม่พบข้อมูลในช่วงวันที่ที่เลือก
          </div>
        )}
      </div>

      {/* กราฟล่าง: ยอดขายรายเดือน (บาท) แบบแท่ง */}
      {monthly?.length > 0 && (
        <div>
          <h3 className="font-semibold mt-6 mb-2">ยอดขายรายเดือน (บาท)</h3>
          <div className="h-[300px]">
            <Bar data={monthlyBarData} options={monthlyBarOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
