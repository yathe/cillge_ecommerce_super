"use client";
import React from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
  const { openSignIn } = useClerk();

  return (
    <nav
      className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 
      bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 
      backdrop-blur-md shadow-md border-b border-yellow-200 text-gray-800 z-50 font-serif"
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
            <Image className="w-5 h-5" src={assets.user_icon} alt="user icon" />
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
            <Image className="w-5 h-5" src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
