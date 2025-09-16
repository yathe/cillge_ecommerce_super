'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import SideBar from "@/components/seller/Sidebar";
import Footers from "@/components/seller/Footer";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
const Home = () => {
  const {isSeller} = useAppContext();
   const router = useRouter();

  // ✅ Redirect to /seller when isSeller is true
  useEffect(() => {
    if (isSeller) {
      router.push("/seller");
    }
  }, [isSeller, router]);
  return (
    <>
    {isSeller ?(
      <>
      <Navbar/>
      <SideBar />
      <Footers />
      </>
    ):(
      <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts />
        <FeaturedProduct />
        <Banner />
        <NewsLetter />
      </div>
      <Footer />
      </>
      )}
    </>
  );
};

export default Home;
