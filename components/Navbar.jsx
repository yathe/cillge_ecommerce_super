"use client";
import React, { useState, useEffect } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import BenefitsDisplay from "./BenefitsDisplay";
import axios from "axios";
import { DollarSign } from "lucide-react";

const Navbar = () => {
  const { isSeller, router, user, getToken, currency } = useAppContext();
  const { openSignIn } = useClerk();
  const [benefitsData, setBenefitsData] = useState(null);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  const fetchBenefits = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const { data } = await axios.get("/api/coupon/my-benefits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBenefitsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch benefits:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBenefits();
      const interval = setInterval(fetchBenefits, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <>
      <nav
        className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 
        bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 
        backdrop-blur-md shadow-md border-b border-yellow-200 text-gray-800 z-40 font-serif"
      >
        <Image
          className="cursor-pointer w-20 md:w-24"
          onClick={() => router.push("/")}
          src={assets.cillage}
          alt="logo"
        />

        <div className="flex items-center gap-4 lg:gap-10 max-md:hidden text-sm font-medium">
          <Link
            href="/"
            className="hover:text-yellow-800 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/all-products"
            className="hover:text-yellow-800 transition-colors duration-200"
          >
            Shop
          </Link>
          <Link
            href="/"
            className="hover:text-yellow-800 transition-colors duration-200"
          >
            About Us
          </Link>
          <Link
            href="/"
            className="hover:text-yellow-800 transition-colors duration-200"
          >
            Contact
          </Link>
          <Link
            href="https://zoom-clone-six-gules.vercel.app/"
            className="hover:text-yellow-800 transition-colors duration-200"
          >
            Camera
          </Link>

          {isSeller && (
            <button
              onClick={() => router.push("/seller")}
              className="text-xs px-4 py-1.5 rounded-full border border-yellow-300 bg-yellow-100 
                hover:bg-yellow-200 hover:text-yellow-900 transition-all duration-200"
            >
              Seller Dashboard
            </button>
          )}
        </div>

        <ul className="hidden md:flex items-center gap-5">
          <Image
            className="w-5 h-5 cursor-pointer"
            src={assets.search_icon}
            alt="search icon"
          />

          {/* Benefits Display */}
          {user && benefitsData && benefitsData.referredUsers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowBenefitsModal(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 
                  hover:bg-green-200 transition-all relative"
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {currency}
                  {benefitsData.totalBenefits.toFixed(2)}
                </span>
                {benefitsData.referredUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {benefitsData.referredUsers.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border border-yellow-300 
                bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-all"
            >
              <Image
                className="w-5 h-5"
                src={assets.user_icon}
                alt="user icon"
              />
              Account
            </button>
          )}
        </ul>

        <div className="flex items-center md:hidden gap-3">
          {isSeller && (
            <button
              onClick={() => router.push("/seller")}
              className="text-xs px-3 py-1.5 rounded-full border border-yellow-300 
                bg-yellow-100 hover:bg-yellow-200 hover:text-yellow-900 transition-all"
            >
              Seller Dashboard
            </button>
          )}

          {/* Mobile Benefits Button */}
          {user && benefitsData && benefitsData.referredUsers.length > 0 && (
            <button
              onClick={() => setShowBenefitsModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 
                hover:bg-green-200 transition-all relative"
            >
              <DollarSign className="w-4 h-4" />
              {benefitsData.referredUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {benefitsData.referredUsers.length}
                </span>
              )}
            </button>
          )}

          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
                <UserButton.Action
                  label="Home"
                  labelIcon={<HomeIcon />}
                  onClick={() => router.push("/")}
                />
                <UserButton.Action
                  label="Products"
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push("/all-products")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-yellow-300 
                bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-all"
            >
              <Image
                className="w-5 h-5"
                src={assets.user_icon}
                alt="user icon"
              />
              Account
            </button>
          )}
        </div>
      </nav>

      {/* Benefits Modal */}
      {showBenefitsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <BenefitsDisplay
              isModal={true}
              onClose={() => setShowBenefitsModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
