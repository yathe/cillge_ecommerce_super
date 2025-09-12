"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const Orders = () => {
  const { currency, getToken, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerOrders = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/order/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  return (
    <div className="flex-1 h-screen overflow-y-scroll flex flex-col justify-between text-sm bg-gradient-to-b from-gray-50 to-gray-100">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
            Orders
          </h2>
          <div className="max-w-5xl mx-auto rounded-xl shadow-lg bg-white divide-y divide-gray-200">
            {orders.map((order, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-6 justify-between p-6 hover:bg-gray-50 transition-all duration-300"
              >
                {/* Order Items */}
                <div className="flex-1 flex gap-5 max-w-80">
                  <Image
                    className="w-16 h-16 object-cover rounded-lg shadow-sm bg-gray-100"
                    src={assets.box_icon}
                    alt="box_icon"
                  />
                  <p className="flex flex-col gap-2 text-gray-700">
                    <span className="font-medium text-base text-gray-900">
                      {order.items
                        .map(
                          (item) => item.product.name + ` x ${item.quantity}`
                        )
                        .join(", ")}
                    </span>
                    <span className="text-sm text-gray-500">
                      Items: {order.items.length}
                    </span>
                  </p>
                </div>

                {/* Address */}
                <div className="text-gray-700 text-sm">
                  <p className="leading-6">
                    <span className="font-medium text-gray-900">
                      {order.address.fullName}
                    </span>
                    <br />
                    <span>{order.address.area}</span>
                    <br />
                    <span>
                      {`${order.address.city}, ${order.address.state}`}
                    </span>
                    <br />
                    <span className="text-gray-500">
                      {order.address.phoneNumber}
                    </span>
                  </p>
                </div>

                {/* Amount */}
                <p className="font-semibold text-lg text-gray-900 my-auto">
                  {currency}
                  {order.amount}
                </p>

                {/* Order Meta */}
                <div className="text-sm text-gray-600 my-auto space-y-1">
                  <span className="bg-gray-100 px-2 py-1 rounded-lg w-fit block">
                    Method: <span className="font-medium">COD</span>
                  </span>
                  <span>
                    Date:{" "}
                    <span className="font-medium">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="text-yellow-600 font-medium">
                    Payment: Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;
