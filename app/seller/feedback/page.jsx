"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const FeedBack = () => {
 

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      

      const { data } = await axios.get("/api/feedback1");
      if (data.success) {
        setOrders(data.user);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    
      fetchFeedback();
    
  }, []);

  return (
    <div className="flex-1 h-screen overflow-y-scroll flex flex-col justify-between text-sm bg-gradient-to-b from-gray-50 to-gray-100">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
            FeedBack
          </h2>
          <div
              
                className="flex flex-col md:flex-row max-md:flex-row gap-6 justify-between p-6 hover:bg-gray-50 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-gray-800 tracking-wide [@media(max-width:430px)]:text-xs">
            UserName
          </h2>
          <h2 className="text-2xl font-semibold text-gray-800 tracking-wide [@media(max-width:430px)]:text-xs">
            Comments
          </h2>
          <h2 className="text-2xl font-semibold text-gray-800 tracking-wide [@media(max-width:430px)]:text-xs">
            Rating
          </h2>
                </div>
          <div className=" shadow-lg bg-white divide-y divide-gray-200">
            {orders.map((order, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row max-md:flex-row gap-6 justify-between p-6 hover:bg-gray-50 transition-all duration-300 "
              >
                

                {/* Address */}
                <div className="text-gray-700 text-sm [@media(max-width:430px)]:text-xs">
                  <p className="leading-6 font-semibold text-lg text-gray-900 my-auto [@media(max-width:430px)]:text-xs">
                    
                      {order.username}
                    
                   
                  </p>
                </div>

                {/* Amount */}
                <p className="font-semibold text-lg text-gray-900 my-auto [@media(max-width:430px)]:text-xs">
                  
                  {order.comment}
                </p>

                 <p className="font-semibold text-lg text-orange-400 my-auto [@media(max-width:430px)]:text-xs">
                  
                  {order.rating}
                </p>


              </div>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default FeedBack;
