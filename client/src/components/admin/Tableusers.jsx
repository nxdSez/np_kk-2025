// rafce
import React, { useState, useEffect } from "react";
import { getListAllUsers } from "../../api/admin";
import useNpStore from "../../store/nopporn-stores"
import { changeUserStatus, changeUserRole } from "../../api/admin";
import { toast } from "react-toastify";
const TableUsers = () => {
  const token = useNpStore((state) => state.token);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // code body
    handleGetUsers(token);
  }, []);

  const handleGetUsers = (token) => {
    getListAllUsers(token)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleChangeUserStatus = (userId, userStatus) => {
    console.log(userId, userStatus);
    const value = {
      id: userId,
      enable: !userStatus,
    };
    changeUserStatus(token, value)
      .then((res) => {
        console.log(res);
        handleGetUsers(token);
        toast.success("Update Status Success!!", { position: "top-center" });
      })
      .catch((err) => console.log(err));
  };

  const handleChangeUserRole = (userId, userRole) => {
    // console.log(userId, userStatus);
    const value = {
      id: userId,
      role: userRole,
    };
    changeUserRole(token, value)
      .then((res) => {
        console.log(res);
        handleGetUsers(token);
        toast.success("Update Role Success!!");
      })
      .catch((err) => console.log(err));
  };

  console.log(users);
  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <table className="w-full">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>Email</th>
            <th>สิทธิ์</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {users?.map((el, i) => (
            <tr key={el.id}>
              <td>{i + 1}</td>
              <td>{el.email}</td>

              <td>
                <select
                  onChange={(e) => handleChangeUserRole(el.id, e.target.value)}
                  value={el.role}
                >
                  <option>user</option>
                  <option>admin</option>
                  <option>employee</option>
                </select>
              </td>

              <td>{el.enable ? "ใช้งาน" : "ไม่ใช้งาน"}</td>
              <td>
                <button
                  className="bg-yellow-500 text-white 
                  p-1 rounded-md shadow-md"
                  onClick={() => handleChangeUserStatus(el.id, el.enable)}
                >
                  {el.enable ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableUsers;