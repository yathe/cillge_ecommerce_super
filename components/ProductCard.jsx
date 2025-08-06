import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, router } = useAppContext();

  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-2 max-w-[200px] w-full cursor-pointer font-serif 
        p-3 rounded-xl bg-gradient-to-b from-yellow-50 to-amber-100 border border-yellow-200 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative bg-white rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
        <Image
          src={product.image[0]}
          alt={product.name}
          className="group-hover:scale-105 transition-transform duration-300 ease-in-out object-cover w-4/5 h-4/5 md:w-full md:h-full"
          width={800}
          height={800}
        />
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-yellow-100 transition">
          <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" />
        </button>
      </div>

      <p className="md:text-base text-sm font-semibold pt-1 text-gray-800 w-full truncate">
        {product.name}
      </p>

      <p className="w-full text-xs text-gray-500 max-sm:hidden truncate">
        {product.description}
      </p>

      <div className="flex items-center gap-2">
        <p className="text-xs text-yellow-800">{4.5}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              className="h-3 w-3"
              src={
                index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon
              }
              alt="star_icon"
            />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-semibold text-yellow-900">
          {currency}
          {product.offerPrice}
        </p>
        <button
          className="max-sm:hidden px-4 py-1.5 text-xs rounded-full border border-yellow-300 
          text-yellow-800 hover:bg-yellow-100 transition"
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
