import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, getToken, user } =
    useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [code,setCode] = useState("");
  const [newcode,setNewcode] = useState("");
  const [couponstatus,setCouponstatus] = useState(false);
  const [genstatus,setGenstatus] = useState(false);
  const [discount,setDiscount] = useState();
  // Fetch addresses
  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
const generateStatus = async()=>{
  try{
      const token = await getToken();
      const { data } = await axios.get("/api/coupon/search", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if(!data.success){
        setGenstatus(true);
      }

  }
  catch(error){
toast.error(error.message);
  }
}
const applyCoupon = async()=>{
  try{
const token = await getToken();
      const { data } = await axios.get("/api/coupon/applycoupon", {
        headers: { Authorization: `Bearer ${token}` },
        
      },{code});
      if(data.success){
        setCouponstatus(true);
        setCode("");
      }
  }
  catch(error){
    toast.error(error.message);
  }
}
const generateCoupon = async()=>{
  try{
    const token = await getToken();
const { data } = await axios.post("/api/coupon/newcoupon", {
        headers: { Authorization: `Bearer ${token}` },
        
      },{code:newcode});
      if(data.success){
        
        setNewcode("");
      }
  }
  catch(error){
     toast.error(error.message);
  }
}
const getDiscount = async()=>{
  try{
const token = await getToken();
const { data } = await axios.get("/api/coupon/UserSearch", {
        headers: { Authorization: `Bearer ${token}` },
        
      });
      if(data.success){
        setDiscount(data.dis);
        toast.success("Order placed!");
      }
  }
  catch(error){
     toast.error(error.message);
  }
}
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  
  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  return (
    <div className="w-full md:w-96 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
        Order Summary
      </h2>
      <hr className="border-gray-200 mb-6" />

      {/* Address Selection */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Select Address
        </label>
        <div className="relative">
          <button
            className="peer w-full text-left px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 transition flex justify-between items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="truncate">
              {selectedAddress
                ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}`
                : "Select Address"}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <ul className="absolute w-full bg-white border border-gray-200 shadow-lg mt-1 rounded-lg z-10 max-h-48 overflow-auto">
              {userAddresses.map((address, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-orange-50 cursor-pointer"
                  onClick={() => handleAddressSelect(address)}
                >
                  {address.fullName}, {address.area}, {address.city},{" "}
                  {address.state}
                </li>
              ))}
              <li
                onClick={() => router.push("/add-address")}
                className="px-4 py-2 text-center text-orange-600 hover:bg-orange-50 cursor-pointer font-medium"
              >
                + Add New Address
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter promo code"
            className="flex-grow outline-none px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 bg-gray-50"
            onChange={(e)=>setCode(e.code)}
            value={code}
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium transition"
          onClick={applyCoupon}>
            Apply
          </button>
        </div>
         <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium transition mt-3"
         onClick={generateStatus}>
            Generate
          </button>
          { genstatus &&(<div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Enter promo code"
            className="flex-grow outline-none px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 bg-gray-50"
            value={newcode}
            onChange={(e)=>setNewcode(e.newcode)}/>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium transition"
          onClick={generateCoupon}>
            Coupon
          </button>
        </div>)}
      </div>

      <hr className="border-gray-200 mb-4" />

      {/* Price Details */}
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between text-sm">
          <span className="uppercase">Items {getCartCount()}</span>
          <span>
            {currency}
            {getCartAmount()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping Fee</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (2%)</span>
          <span>
            {currency}
            {Math.floor(getCartAmount() * 0.02)}
          </span>
        </div>
        { couponstatus &&(<div className="flex justify-between text-sm">
          <span>Discount to use coupon (2%)</span>
          <span>
            -{currency}
            {Math.ceil(getCartAmount() * 0.02)}
          </span>
        </div>)}
        <div className="flex justify-between text-lg font-semibold border-t pt-3">
          <span>Total</span>
          <span>
            {currency}
            {getCartAmount() + Math.floor(getCartAmount() * 0.02)-Math.ceil(getCartAmount() * 0.02)}
          </span>
        </div>
      </div>

      {/* Place Order */}
      <button
        onClick={getDiscount}
        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
