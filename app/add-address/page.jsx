"use client";
import { assets } from "../../assets/assets";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AddAddress = () => {
  const { getToken, router } = useAppContext();
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/add-address",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between items-center gap-12 min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        {/* Form */}
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-lg bg-white shadow-xl rounded-3xl p-8 border border-gray-100"
        >
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Add Shipping Address
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Please fill in your details below.
          </p>

          <div className="space-y-4 mt-8">
            <input
              className="px-4 py-3 border border-gray-300 rounded-xl w-full text-gray-700 shadow-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              type="text"
              placeholder="Full name"
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              value={address.fullName}
            />
            <input
              className="px-4 py-3 border border-gray-300 rounded-xl w-full text-gray-700 shadow-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              type="text"
              placeholder="Phone number"
              onChange={(e) =>
                setAddress({ ...address, phoneNumber: e.target.value })
              }
              value={address.phoneNumber}
            />
            <input
              className="px-4 py-3 border border-gray-300 rounded-xl w-full text-gray-700 shadow-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              type="text"
              placeholder="Pin code"
              onChange={(e) =>
                setAddress({ ...address, pincode: e.target.value })
              }
              value={address.pincode}
            />
            <textarea
              className="px-4 py-3 border border-gray-300 rounded-xl w-full text-gray-700 shadow-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition resize-none"
              rows={4}
              placeholder="Address (Area and Street)"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
            ></textarea>
            <div className="flex gap-4">
              <input
                className="px-4 py-3 border border-gray-300 rounded-xl w-full text-gray-700 shadow-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                type="text"
                placeholder="City/District/Town"
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                value={address.city}
              />
              <input
                className="px-4 py-3 border border-gray-300 rounded-xl w-full text-gray-700 shadow-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                type="text"
                placeholder="State"
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                value={address.state}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Save address
          </button>
        </form>

        {/* Image with Glow */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
          <Image
            className="relative max-w-xs md:max-w-sm lg:max-w-md w-full rounded-2xl shadow-lg"
            src={assets.my_location_image}
            alt="my_location_image"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;
