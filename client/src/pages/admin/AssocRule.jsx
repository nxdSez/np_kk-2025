import React, { useEffect, useState } from "react";
import useNpStore from "../../store/nopporn-stores";
import {
  listAssoc,
  createAssocApi,
  updateAssocApi,
  deleteAssocApi,
} from "../../api/admin";
import { searchProductsAdmin } from "../../api/admin";
import { toast } from "react-toastify";

const AssocRules = () => {
  const token = useNpStore((s) => s.token);
  const [rows, setRows] = useState([]);
  const [adding, setAdding] = useState({ name: "", x: "", y: "", weight: 1, isActive: true });

  // autosuggest products
  const [qX, setQX] = useState("");
  const [qY, setQY] = useState("");
  const [optsX, setOptsX] = useState([]);
  const [optsY, setOptsY] = useState([]);

  const fetchRows = async () => {
    const res = await listAssoc(token);
    setRows(res.data || []);
  };

  useEffect(() => { if (token) fetchRows(); }, [token]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!qX.trim()) return setOptsX([]);
      const r = await searchProductsAdmin(token, qX.trim());
      setOptsX(r.data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [qX, token]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!qY.trim()) return setOptsY([]);
      const r = await searchProductsAdmin(token, qY.trim());
      setOptsY(r.data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [qY, token]);

  const saveNew = async () => {
    try {
      const payload = {
        name: adding.name || "-",
        sourceProductId: Number(adding.x),
        targetProductId: Number(adding.y),
        weight: Number(adding.weight || 1),
        isActive: Boolean(adding.isActive),
      };
      const res = await createAssocApi(token, payload);
      toast.success("สร้างกฎสำเร็จ");
      setAdding({ name: "", x: "", y: "", weight: 1, isActive: true });
      setQX(""); setQY(""); setOptsX([]); setOptsY([]);
      setRows([res.data, ...rows]);
    } catch (e) {
      toast.error(e?.response?.data?.message || "บันทึกไม่สำเร็จ");
    }
  };

  const updateRow = async (id, patch) => {
    try {
      const res = await updateAssocApi(token, id, patch);
      setRows((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      toast.success("อัปเดตสำเร็จ");
    } catch (e) {
      toast.error("อัปเดตไม่สำเร็จ");
    }
  };

  const delRow = async (id) => {
    if (!confirm("ลบกฎนี้?")) return;
    await deleteAssocApi(token, id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("ลบแล้ว");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-3">Association Rules</h2>

      {/* Add row */}
      <div className="grid grid-cols-12 gap-2 items-end mb-4">
        <div className="col-span-3">
          <label className="text-sm">Rule name</label>
          <input className="border p-2 w-full rounded" value={adding.name}
                 onChange={(e)=>setAdding({...adding, name: e.target.value})}/>
        </div>

        <div className="col-span-3">
          <label className="text-sm">X (source)</label>
          <input className="border p-2 w-full rounded" placeholder="ค้นหาชื่อ/ID"
                 value={qX} onChange={(e)=>{ setQX(e.target.value) }} />
          {optsX.length > 0 && (
            <div className="border rounded mt-1 max-h-40 overflow-auto bg-white">
              {optsX.map(p => (
                <div key={p.id} className="p-2 hover:bg-gray-100 cursor-pointer"
                     onClick={()=>{ setAdding(a=>({...a, x: p.id})); setQX(`${p.title} (#${p.id})`); setOptsX([]); }}>
                  {p.title} <span className="text-xs text-gray-500">#{p.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-3">
          <label className="text-sm">Y (target)</label>
          <input className="border p-2 w-full rounded" placeholder="ค้นหาชื่อ/ID"
                 value={qY} onChange={(e)=>{ setQY(e.target.value) }} />
          {optsY.length > 0 && (
            <div className="border rounded mt-1 max-h-40 overflow-auto bg-white">
              {optsY.map(p => (
                <div key={p.id} className="p-2 hover:bg-gray-100 cursor-pointer"
                     onClick={()=>{ setAdding(a=>({...a, y: p.id})); setQY(`${p.title} (#${p.id})`); setOptsY([]); }}>
                  {p.title} <span className="text-xs text-gray-500">#{p.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="text-sm">Weight</label>
          <input type="number" min={1} className="border p-2 w-full rounded"
                 value={adding.weight}
                 onChange={(e)=>setAdding({...adding, weight: e.target.value})}/>
        </div>

        <div className="col-span-1">
          <label className="text-sm">Active</label>
          <input type="checkbox" className="ml-2"
                 checked={adding.isActive}
                 onChange={(e)=>setAdding({...adding, isActive: e.target.checked})}/>
        </div>

        <div className="col-span-12 sm:col-span-0 text-right">
          <button className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={saveNew}>Save</button>
        </div>
      </div>

      {/* Table */}
      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Rule</th>
            <th className="p-2">X</th>
            <th className="p-2">Y</th>
            <th className="p-2">Weight</th>
            <th className="p-2">Active</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r)=>(
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.source?.title} <span className="text-xs text-gray-500">#{r.source?.id}</span></td>
              <td className="p-2">{r.target?.title} <span className="text-xs text-gray-500">#{r.target?.id}</span></td>
              <td className="p-2">
                <input type="number" min={1} defaultValue={r.weight}
                       onBlur={(e)=> updateRow(r.id, { weight: Number(e.target.value) }) }
                       className="border p-1 w-24 rounded"/>
              </td>
              <td className="p-2">
                <input type="checkbox" defaultChecked={r.isActive}
                       onChange={(e)=> updateRow(r.id, { isActive: e.target.checked }) }/>
              </td>
              <td className="p-2">
                <button className="text-red-600" onClick={()=>delRow(r.id)}>del</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-center text-gray-500">ยังไม่มีข้อมูล</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssocRules;
