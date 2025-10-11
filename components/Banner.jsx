import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 md:py-0 bg-[#f0f8ff] my-16 rounded-xl overflow-hidden border border-blue-100">
      {/* Left side - Dairy product image */}
      <Image
        className="max-w-56"
        src={assets.jbl_soundbox_image} // Replace with milk bottle or dairy product image
        alt="fresh_milk_bottle"
      />

      {/* Center - Content */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold max-w-[290px] text-blue-800">
          Fresh Dairy Delivered to Your Doorstep
        </h2>
        <p className="max-w-[343px] font-medium text-blue-600/80">
          From farm-fresh milk to creamy yogurt—everything you need for a
          healthy lifestyle
        </p>
        <button className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-green-600 hover:bg-green-700 rounded text-white transition-colors">
          Shop Now
          <Image
            className="group-hover:translate-x-1 transition"
            src={assets.arrow_icon_white}
            alt="arrow_icon_white"
          />
        </button>
      </div>

      {/* Right side - Dairy products showcase */}
      <Image
        className="hidden md:block max-w-80"
        src={assets.md_controller_image} // Replace with dairy basket or multiple dairy products image
        alt="dairy_products_basket"
      />
      <Image
        className="md:hidden"
        src={assets.sm_controller_image} // Replace with mobile dairy product image
        alt="dairy_products_mobile"
      />
    </div>
  );
};

export default Banner;
