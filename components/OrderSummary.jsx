// Import context hook to access global app state and functions
import { useAppContext } from "@/context/AppContext";
// Import React and hooks
import React, { useEffect, useState } from "react";
// Axios for making API requests
import axios from "axios";
// Toast for showing success/error notifications
import toast from "react-hot-toast";
import { createTransaction } from "@/app/api/Transaction/actions/route";
import FeedbackForm from "./FeedBackForm";
const OrderSummary = () => {
  // Extract values and functions from AppContext (global state)
  const {
    currency, // current currency symbol (e.g. $, ₹)
    router, // Next.js router for navigation
    getCartCount, // function to get total cart item count
    getCartAmount, // function to get total cart amount
    getToken, // function to fetch user's auth token
    user, // current logged-in user
    cartItems, // cart items object (productId -> qty)
    setCartItems, // setter to update cart items
  } = useAppContext();

  // Local states
  const [selectedAddress, setSelectedAddress] = useState(null); // selected shipping address
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // address dropdown open/close
  const [userAddresses, setUserAddresses] = useState([]); // list of user addresses
  const [code, setCode] = useState(""); // promo code entered
  const [newcode, setNewcode] = useState(""); // new coupon code when generating
  const [couponstatus, setCouponstatus] = useState(false); // flag: coupon applied?
  const [genstatus, setGenstatus] = useState(false); // flag: show generate coupon input?
  const [discount, setDiscount] = useState(0); // discount amount

  // 🔹 Fetch user addresses from backend
  const fetchUserAddresses = async () => {
    try {
      const token = await getToken(); // get JWT token
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserAddresses(data.addresses); // save addresses
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]); // preselect first address
        }
      } else {
        toast.error(data.message); // show error if failed
      }
    } catch (error) {
      toast.error(error.message); // show error message
    }
  };

  // 🔹 Apply coupon entered by user
  const applyCoupon = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/coupon/applycoupon",
        { code }, // send coupon code
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCouponstatus(true); // mark coupon applied
        setDiscount(data.discount); // set discount from backend
        setCode(""); // clear input
        toast.success(data.message); // success message
      } else {
        toast.error(data.message); // show backend error
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 🔹 Generate a new coupon (admin-like feature?)
  const generateCoupon = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/coupon/newcoupon",
        { code: newcode }, // send new coupon code to create
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNewcode(""); // reset input
        setGenstatus(false); // hide generate form
        toast.success("Coupon generated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 🔹 Fetch discount info for current user
  const getDiscount = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/coupon/UserSearch", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setDiscount(data.dis); // set discount amount
        toast.success("Order placed!"); // confirmation
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Handle selecting an address from dropdown
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false); // close dropdown
  };
  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  // 🔹 Create order and send to backend
  const createOrder = async () => {
    try {
      // Require address
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      // Convert cart object into array of {product, quantity}
      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      // Remove zero-quantity items
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error("Cart is empty");
      }

      // Send order request
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id, // only send address id
          items: cartItemsArray, // send items
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message); // show success
        setCartItems({}); // clear cart
        
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Place order = first check discount then create order
  

  // 🔹 Fetch addresses when user logs in
  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

 useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePlaceOrder = async () => {
    await getDiscount();
    await createOrder();
    
    try {
      const transaction = {
        plan: "Cart Checkout",
        amount: total, // paise
        credits: 0,
        buyerId: user?._id,
      };

      const {data} = await axios.post("/api/Transaction/actions",{transaction:transaction});
      
      const options = {
        key: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY,
        amount: data.amount/100,
        currency: data.currency,
        name: "Your Store",
        description: "Cart Payment",
        order_id: data.orderId,
        handler: function (response) {
          
          setCartItems({});
          setPendingOrder(response); // store payment info if needed
        setShowFeedback(true);
        },
        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "guest@example.com",
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function () {
            toast.error("Payment canceled!");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    }
  };
  // 🔹 Price calculations
  const subtotal = getCartAmount(); // base amount
  const tax = Math.floor(subtotal * 0.02); // 2% tax
  const total = subtotal + tax - (discount || 0); // final total after discount

  return (
    <div className="w-full md:w-96 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
        Order Summary
      </h2>
      <hr className="border-gray-200 mb-6" />

      {/* ---------- Address Selection ---------- */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Select Address
        </label>
        <div className="relative">
          {/* Dropdown toggle */}
          <button
            className="peer w-full text-left px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 transition flex justify-between items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Show selected address or placeholder */}
            <span className="truncate">
              {selectedAddress
                ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}`
                : "Select Address"}
            </span>
            {/* Dropdown arrow */}
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

          {/* Dropdown list of addresses */}
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
              {/* Add new address option */}
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

      {/* ---------- Promo Code Section ---------- */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Promo Code
        </label>
        <div className="flex gap-2">
          {/* Input for coupon */}
          <input
            type="text"
            placeholder="Enter promo code"
            className="flex-grow outline-none px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 bg-gray-50"
            onChange={(e) => setCode(e.target.value)}
            value={code}
          />
          {/* Apply button */}
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium transition"
            onClick={applyCoupon}
          >
            Apply
          </button>
        </div>
        {/* Show coupon generator input when requested */}
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium transition mt-3"
          onClick={() => setGenstatus(true)}
        >
          Generate
        </button>
        {genstatus && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow outline-none px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 bg-gray-50"
              value={newcode}
              onChange={(e) => setNewcode(e.target.value)}
            />
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium transition"
              onClick={generateCoupon}
            >
              Coupon
            </button>
          </div>
        )}
      </div>

      <hr className="border-gray-200 mb-4" />

      {/* ---------- Price Details ---------- */}
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between text-sm">
          <span className="uppercase">Items {getCartCount()}</span>
          <span>
            {currency}
            {subtotal}
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
            {tax}
          </span>
        </div>
        {/* Show discount row if coupon applied */}
        {couponstatus && discount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Discount</span>
            <span>
              -{currency}
              {discount}
            </span>
          </div>
        )}
        {/* Final total */}
        <div className="flex justify-between text-lg font-semibold border-t pt-3">
          <span>Total</span>
          <span>
            {currency}
            {total}
          </span>
        </div>
      </div>

      {/* ---------- Place Order Button ---------- */}
      <button
        onClick={handlePlaceOrder}
        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Place Order
      </button>
       {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <FeedbackForm
              onSubmit={(feedback) => {
                console.log("User feedback:", feedback);
                setShowFeedback(false); // close popup
                router.push("/order-placed"); // ✅ Navigate AFTER feedback
              }}
              onCancel={() => setShowFeedback(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
