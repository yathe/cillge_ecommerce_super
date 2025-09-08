"use client";
import React from "react";
import Link from "next/link";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const pathname = usePathname();
  const menuItems = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: assets.product_list_icon,
    },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
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
    <div
      className="md:w-64 w-16 min-h-screen border-r border-gray-200 bg-white 
      flex flex-col py-4 shadow-sm sticky top-0 z-40"
    >
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link href={item.path} key={item.name} passHref>
            <div
              className={`flex items-center py-3 px-4 gap-3 cursor-pointer transition-all duration-300 
                ${
                  isActive
                    ? "bg-orange-100 border-r-4 border-orange-500 text-orange-700 font-semibold shadow-inner"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Image
                src={item.icon}
                alt={`${item.name.toLowerCase()}_icon`}
                className={`w-7 h-7 md:w-6 md:h-6 transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              />
              <p
                className={`md:block hidden text-sm ${
                  isActive ? "font-semibold text-orange-700" : "text-gray-600"
                }`}
              >
                {item.name}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
