"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CouponAnalytics = () => {
  const { getToken, user } = useAppContext();
  const [couponData, setCouponData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCoupons, setExpandedCoupons] = useState({});

  const fetchCouponAnalytics = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/analytics/all-coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCouponData(data.data);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleCouponExpansion = (couponCode) => {
    setExpandedCoupons((prev) => ({
      ...prev,
      [couponCode]: !prev[couponCode],
    }));
  };

  useEffect(() => {
    if (user) {
      fetchCouponAnalytics();
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  const profitByCoupon = couponData.map((coupon) => ({
    code: coupon.code,
    profit: coupon.totalProfit,
    owner: coupon.ownerName,
  }));

  const applicationsByCoupon = couponData.map((coupon) => ({
    code: coupon.code,
    applications: coupon.totalApplications,
    owner: coupon.ownerName,
  }));

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left">
        All Coupons Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center sm:text-left">
          <h3 className="text-sm sm:text-lg font-medium text-gray-700">
            Total Coupons
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            {couponData.length}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center sm:text-left">
          <h3 className="text-sm sm:text-lg font-medium text-gray-700">
            Total Applications
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            {couponData.reduce(
              (sum, coupon) => sum + coupon.totalApplications,
              0
            )}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center sm:text-left">
          <h3 className="text-sm sm:text-lg font-medium text-gray-700">
            Total Profit
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600">
            ₹
            {couponData
              .reduce((sum, coupon) => sum + coupon.totalProfit, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bar Chart - Profit by Coupon */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-4">
          Profit by Coupon
        </h3>
        <div className="w-full h-64 sm:h-80 md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitByCoupon}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="code" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value}`, "Profit"]}
                labelFormatter={(value) => {
                  const coupon = profitByCoupon.find((c) => c.code === value);
                  return `Coupon: ${value} (Owner: ${coupon?.owner})`;
                }}
              />
              <Legend />
              <Bar dataKey="profit" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Applications by Coupon */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-4">
          Applications by Coupon
        </h3>
        <div className="w-full h-64 sm:h-80 md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={applicationsByCoupon}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="code" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value}`, "Applications"]}
                labelFormatter={(value) => {
                  const coupon = applicationsByCoupon.find(
                    (c) => c.code === value
                  );
                  return `Coupon: ${value} (Owner: ${coupon?.owner})`;
                }}
              />
              <Legend />
              <Bar dataKey="applications" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Coupon Information */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-4">
          All Coupons Details
        </h3>

        {couponData.map((coupon, index) => (
          <div
            key={index}
            className="mb-6 border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer p-3 bg-gray-50 rounded-lg"
              onClick={() => toggleCouponExpansion(coupon.code)}
            >
              <div className="mb-2 sm:mb-0">
                <h4 className="font-semibold text-gray-800">
                  Coupon: {coupon.code}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Owner: {coupon.ownerName} | Discount:{" "}
                  {coupon.discountPercentage}% | Benefit:{" "}
                  {coupon.ongoingBenefitPercentage}% | Applications:{" "}
                  {coupon.totalApplications} | Profit: ₹
                  {coupon.totalProfit.toFixed(2)} | Status:{" "}
                  {coupon.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <span className="text-gray-500 self-end sm:self-auto">
                {expandedCoupons[coupon.code] ? "▲" : "▼"}
              </span>
            </div>

            {expandedCoupons[coupon.code] && (
              <div className="mt-4 overflow-x-auto">
                <h5 className="font-medium text-gray-700 mb-2">
                  Users who applied this coupon:
                </h5>
                <table className="w-full text-xs sm:text-sm md:text-base divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Profit Generated
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupon.referredUsers.map((user, userIndex) => (
                      <tr key={userIndex}>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                          {user.userName}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                          ₹{user.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                          ₹{user.totalBenefit.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                          {user.purchaseCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default CouponAnalytics;
