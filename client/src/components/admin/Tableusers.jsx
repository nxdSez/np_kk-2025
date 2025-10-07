// rafce
import React, { useState, useEffect } from "react";
import useNpStore from "../../store/nopporn-stores";
import { getListAllUsers, changeUserStatus, changeUserRole } from "../../api/admin";
import { toast } from "react-toastify";

const TableUsers = () => {
  const token = useNpStore((state) => state.token);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    handleGetUsers(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleGetUsers = async (tk) => {
    try {
      setLoading(true);
      const res = await getListAllUsers(tk);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserStatus = async (userId, currentEnable) => {
    const nextEnable = !currentEnable;
    const confirmMsg = nextEnable
      ? "ยืนยันเปิดการใช้งานผู้ใช้งานนี้หรือไม่?"
      : "ยืนยันปิดการใช้งานผู้ใช้งานนี้หรือไม่?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdatingId(userId);
      await changeUserStatus(token, { id: userId, enable: nextEnable });
      toast.success("อัปเดตสถานะสำเร็จ");
      await handleGetUsers(token);
    } catch (err) {
      console.error(err);
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeUserRole = async (userId, role) => {
    try {
      setUpdatingId(userId);
      await changeUserRole(token, { id: userId, role });
      toast.success("อัปเดตสิทธิ์สำเร็จ");
      await handleGetUsers(token);
    } catch (err) {
      console.error(err);
      toast.error("อัปเดตสิทธิ์ไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">รายการผู้ใช้งาน</h2>
        <button
          onClick={() => handleGetUsers(token)}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
        >
          รีเฟรช
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="text-left text-sm text-gray-600">
            <tr>
              <th className="px-3 py-2">ลำดับ</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">สิทธิ์</th>
              <th className="px-3 py-2">สถานะ</th>
              <th className="px-3 py-2">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  ไม่พบผู้ใช้งาน
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id} className="bg-white hover:bg-gray-50">
                  <td className="px-3 py-2 align-middle">{i + 1}</td>
                  <td className="px-3 py-2 align-middle">{u.email}</td>

                  <td className="px-3 py-2 align-middle">
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                      value={u.role}
                      disabled={updatingId === u.id}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="employee">employee</option>
                    </select>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    {u.enable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        ไม่ใช้งาน
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <button
                      className={`px-3 py-1.5 text-sm rounded-md shadow-sm text-white ${
                        u.enable
                          ? "bg-rose-500 hover:bg-rose-600"
                          : "bg-amber-500 hover:bg-amber-600"
                      } disabled:opacity-60`}
                      onClick={() => handleChangeUserStatus(u.id, u.enable)}
                      disabled={updatingId === u.id}
                    >
                      {updatingId === u.id
                        ? "กำลังอัปเดต..."
                        : u.enable
                        ? "ปิดการใช้งาน"
                        : "เปิดการใช้งาน"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableUsers;
