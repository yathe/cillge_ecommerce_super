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
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const { isSeller, router, user, getToken, currency } = useAppContext();
  const { openSignIn } = useClerk();
  const pathname = usePathname();
  const [benefitsData, setBenefitsData] = useState(null);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
const navItems = [
      { name: "Add Product", path: "/seller", icon: assets.add_icon },
      {
        name: "Product List",
        path: "/seller/product-list",
        icon: assets.product_list_icon,
      },
      { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
      { name: "FeedBack", path: "/seller/feedback", icon: assets.order_icon },
      {
        name: "Analytics",
        path: "/seller/analytics",
        icon: assets.analytics_icon,
      },
      {
        name: "Coupon Analytics",
        path: "/seller/coupon-analytics",
        icon: assets.allanalytics,
      },
    ];
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
           {isSeller ?(
  <button
    onClick={() => router.push("/seller")}
    className="text-xs px-4 py-1.5 rounded-full border border-yellow-300 bg-yellow-100 
      hover:bg-yellow-200 hover:text-yellow-900 transition-all duration-200"
  >
    Seller Dashboard
  </button>
 )
:(
  <>
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
  </>
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
           {/* Seller Dashboard Button (Mobile) */}
          {isSeller && (
            <>
            <button
              onClick={() => router.push("/seller")}
              className="hidden md:block px-4 py-1.5 rounded-full border border-yellow-300 bg-yellow-100 hover:bg-yellow-200 hover:text-yellow-900 transition-all text-xs"
            >
              Seller Dashboard
            </button>
            <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
            </>
          )}

          {/* Hamburger / Close Button */}
         

          {/* Mobile Benefits Button */}
          {user && benefitsData && benefitsData.referredUsers.length > 0 && (
            <button
              onClick={() => setShowBenefitsModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 
                hover:bg-green-200 transition-all relative"
            >
              <div className="w-4 h-4"><p>₹</p></div>
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
  <div
        className={`transition-all duration-300 overflow-hidden bg-yellow-100 border-b border-gray-200 md:hidden ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="md:hidden flex flex-col gap-3 px-4 pb-4 border-t border-gray-100 first-line items-center">
          {navItems.map((item) => (
             
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 hover:text-orange-600 transition-colors py-1"
            >
               <div
                            className={`flex items-center py-3 px-4 gap-3 ${
                            (pathname === item.path)
                                ? "border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90"
                                : "hover:bg-gray-100/90 border-white"
                            }`}
                          >
                            <Image
                              src={item.icon}
                              alt={`${item.name.toLowerCase()}_icon`}
                              className="w-7 h-7"
                            />
                            <p className="md:block  text-center">{item.name}</p>
                          </div>
            </Link>
          ))}
        </div>
      </div>
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
