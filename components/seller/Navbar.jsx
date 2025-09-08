"use client";
import React from "react";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Navbar = () => {
  const { router } = useAppContext();

  return (
    <div
      className="flex items-center justify-between 
      px-4 sm:px-6 md:px-10 lg:px-16 py-3 
      border-b bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 
      shadow-md sticky top-0 z-50"
    >
      {/* Logo */}
      <Image
        onClick={() => router.push("/")}
        className="w-16 sm:w-18 md:w-20 cursor-pointer transition-transform duration-300 hover:scale-105"
        src={assets.cillage}
        alt="logo"
      />

      {/* Logout Button */}
      <button
        className="bg-gray-700 text-white px-4 py-2 sm:px-6 sm:py-2 
        rounded-full text-xs sm:text-sm md:text-base font-medium
        hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
