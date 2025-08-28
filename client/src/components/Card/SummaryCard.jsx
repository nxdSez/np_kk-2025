import React, { useEffect, useState } from "react";
import { getUserCart, saveAddress } from "../../api/user";
import useNpStore from "../../store/nopporn-stores";
import { numberFormat } from "../../utils/number";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SummaryCard = () => {
  const token = useNpStore((state) => state.token);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [address, setAddress] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) hdlgetUserCart(token);
  }, [token]);

  // recalculates total when products change (fallback if API doesn't return cartTotal)
  useEffect(() => {
    const totalFromProducts = (products || []).reduce((sum, item) => {
      const price = Number(item.product?.price || 0);
      const count = Number(item.count || 0);
      return sum + price * count;
    }, 0);
    // prefer server cartTotal if present and > 0, otherwise use computed value
    setCartTotal((prev) => {
      // if previous cartTotal already came from server and equals computed, keep it
      return totalFromProducts;
    });
  }, [products]);

  const hdlgetUserCart = (token) => {
    getUserCart(token)
      .then((res) => {
        setProducts(res.data.products || []);
        // use server value if provided, otherwise 0 (will be replaced by effect)
        setCartTotal(res.data.cartTotal ?? 0);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleSaveAddress = () => {
    if (!address) {
      toast.error("กรุณากรอกที่อยู่ในการจัดส่ง", { position: "top-center" });
      return;
    }
    saveAddress(token, address)
      .then((res) => {
        console.log("บันทึกที่อยู่เรียบร้อย:", res);
        setAddressSaved(true);
        toast.success(res.data.message, { position: "top-center" });
      })
      .catch((err) => {
        console.log("Error saving address:", err);
      });
  };
  const handleToPayment = () => {
    if (!addressSaved) {
      toast.error("กรุณาบันทึกที่อยู่ในการจัดส่งก่อน", {
        position: "top-center",
      });
      return;
    }
    navigate("/user/payment");
  };

  return (
    <div className="mx-auto">
      <div className="flex gap-4">
        {/* Left */}
        <div className="w-2/4">
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md space-y-2">
            <h1 className="text-lg font-bold">ที่อยู่ในการจัดส่ง</h1>
            <textarea
              required
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-24 p-2 border rounded-md mt-2"
              placeholder="กรุณากรอกที่อยู่ในการจัดส่ง"
            ></textarea>
            <button
              onClick={handleSaveAddress}
              className="bg-blue-500 text-white rounded-md px-4 py-2 mt-2 hover:bg-blue-600"
            >
              บันทึกที่อยู่
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="w-2/4">
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md space-y-4">
            <h1 className="text-lg font-bold">สรุปคำสั่งซื้อ</h1>
            {/* Item List */}
            {products?.length ? (
              products.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p>{item.product?.title || "No title"}</p>
                      <p>
                        จำนวน : {item.count} x{" "}
                        {numberFormat(item.product?.price || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-black font-bold">
                        {numberFormat(
                          (item.count || 0) * (item.product?.price || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">ไม่มีสินค้าในตะกร้า</div>
            )}

            <div>
              <div className="flex justify-between">
                <p>ค่าจัดส่ง:</p>
                <p>0.00</p>
              </div>
              <div className="flex justify-between">
                <p>ส่วนลด:</p>
                <p>0.00</p>
              </div>
            </div>
            <hr />
            {/* Total */}
            <div>
              <div className="flex justify-between">
                <p className="font-bold">รวมยอดสั่งซื้อ:</p>
                <p className="text-black font-bold">{numberFormat(cartTotal)}</p>
              </div>
            </div>
            <hr />
            <div>
              <button
                onClick={handleToPayment}
                className="bg-green-500 text-white shadow-md rounded-md px-4 py-2 w-full hover:bg-green-600 transition-colors"
              >
                ดำเนินการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
