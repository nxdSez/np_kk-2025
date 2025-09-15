import React from "react";
import { ListCheck } from "lucide-react";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { Link, useNavigate } from "react-router-dom";
import { userCart } from "../../api/user";
import { toast } from "react-toastify";

const ListCart = () => {
  const cart = useNpStore((state) => state.carts);
  const user = useNpStore((state) => state.user);
  const token = useNpStore((state) => state.token);
  const getTotalPrice = useNpStore((state) => state.getTotalPrice);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    await userCart(token, {cart})
    .then((res)=>{
      console.log(res)
      toast.success('บันทึกใส่ตะกร้าเรียบร้อยแล้ว', {
        position: "top-center",
      })
      navigate("/checkout");
    })
    .catch((err)=>{
      console.log(err);
      toast.warning(err.response.data.message, {
        position: "top-center",
      })
    })
  }

  return (
    <div className="bg-gray-100 rounded-md p-4 shadow-md">
      {/* Header */}
      <div className="flex gap-4">
        <ListCheck size={36} />
        <p className="text-2xl font-bold mb-4">รายการสินค้า {cart.length} รายการ</p>
      </div>
      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Left (2 columns) */}
        <div className="col-span-2 h-full">
          <div className="p-2 border rounded-md bg-white shadow-sm h-full flex flex-col">
            <div className="overflow-y-auto space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="bg-white p-2 rounded-md shadow-md">
                  {/* Row 1 */}
                  <div className="flex justify-between mb-2">
                    <div className="flex gap-2 items-center">
                      {item.images && item.images.length > 0 ? (
                        <img className="w-16 h-16 rounded-md object-cover" src={item.images[0].url} />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm">{numberFormat(item.price)} x {item.count}</p>
                      </div>
                    </div>
                    <div className="font-bold text-blue-500">
                      {numberFormat(item.price * item.count)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (summary) */}
        <div className="h-full">
          <div className="bg-white p-4 rounded-md shadow-md flex flex-col justify-between h-full">
            <div>
              <p className="font-bold text-2xl mb-4">ยอดรวม</p>
              <div className="flex justify-between mb-4">
                <span>รวมสุทธิ</span>
                <span className="text-2xl">฿{numberFormat(getTotalPrice())}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {
                user
                ? <Link>
                <button
                disabled={cart.length < 1}
                className="bg-blue-500 w-full py-2 rounded-md text-white font-bold hover:bg-blue-600"
                onClick={handleCheckout}
                >
                  สั่งซื้อ
                </button>
              </Link>
                : <Link to={"/login"}>
                <button className="bg-blue-500 w-full py-2 rounded-md text-white font-bold hover:bg-blue-600">
                  Login
                </button>
              </Link>
              }
              <Link to={"/shop"}>
                <button className="bg-white w-full py-2 rounded-md text-black font-bold hover:bg-gray-100 border">
                  แก้ไขรายการ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCart;
