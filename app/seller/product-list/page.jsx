"use client";
import React, { useEffect, useState } from "react";
import { assets, productsDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setProducts(data.products);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerProduct();
    }
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gradient-to-b from-orange-50 to-white">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-2xl font-semibold text-gray-800 tracking-tight">
            All Product
          </h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-xl bg-white border border-gray-200 shadow-lg backdrop-blur-sm">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="bg-orange-100 text-gray-900 text-sm uppercase tracking-wide">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-semibold truncate">
                    Product
                  </th>
                  <th className="px-4 py-3 font-semibold truncate max-sm:hidden">
                    Category
                  </th>
                  <th className="px-4 py-3 font-semibold truncate">Price</th>
                  <th className="px-4 py-3 font-semibold truncate max-sm:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {products.map((product, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-100 hover:bg-orange-50 transition-colors duration-200"
                  >
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-100 rounded-lg p-2 shadow-sm">
                        <Image
                          src={product.image[0]}
                          alt="product Image"
                          className="w-16 rounded-md object-cover"
                          width={1280}
                          height={720}
                        />
                      </div>
                      <span className="truncate w-full font-medium">
                        {product.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      ₹{product.offerPrice}
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md shadow hover:bg-orange-700 transition-colors duration-200"
                      >
                        <span className="hidden md:block">Visit</span>
                        <Image
                          className="h-3.5"
                          src={assets.redirect_icon}
                          alt="redirect_icon"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
