"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders.reverse());
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
      fetchOrders();
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-10 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mt-4 text-gray-800 tracking-wide">
            My Orders
          </h2>

          {loading ? (
            <Loading />
          ) : (
            <div className="max-w-5xl mx-auto divide-y divide-gray-200 shadow-xl rounded-2xl bg-white">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-6 justify-between p-6 hover:bg-gray-50 transition-all duration-300"
                >
                  {/* Order Items */}
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="w-16 h-16 object-cover rounded-xl shadow-md bg-gray-100"
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
                        {`₹{order.address.city}, ₹{order.address.state}`}
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
                  <div className="text-sm text-gray-600 my-auto">
                    <p className="flex flex-col gap-1">
                      <span className="bg-gray-100 px-2 py-1 rounded-lg w-fit">
                        Method: <span className="font-medium">COD</span>
                      </span>
                      <span>
                        Date:{" "}
                        <span className="font-medium">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                      </span>
                      <span className="text-red-500 font-medium">
                        Payment: Pending
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
