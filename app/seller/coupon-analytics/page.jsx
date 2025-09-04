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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

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

  // Prepare data for charts
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
    <div className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        All Coupons Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-700">Total Coupons</h3>
          <p className="text-3xl font-bold text-blue-600">
            {couponData.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-700">
            Total Applications
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {couponData.reduce(
              (sum, coupon) => sum + coupon.totalApplications,
              0
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-700">Total Profit</h3>
          <p className="text-3xl font-bold text-orange-600">
            $
            {couponData
              .reduce((sum, coupon) => sum + coupon.totalProfit, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bar Chart - Profit by Coupon */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Profit by Coupon
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={profitByCoupon}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value) => [`$${value}`, "Profit"]}
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

      {/* Bar Chart - Applications by Coupon */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Applications by Coupon
        </h3>
        <ResponsiveContainer width="100%" height={400}>
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

      {/* Detailed Coupon Information */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          All Coupons Details
        </h3>

        {couponData.map((coupon, index) => (
          <div
            key={index}
            className="mb-6 border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div
              className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 rounded-lg"
              onClick={() => toggleCouponExpansion(coupon.code)}
            >
              <div>
                <h4 className="font-semibold text-gray-800">
                  Coupon: {coupon.code}
                </h4>
                <p className="text-sm text-gray-600">
                  Owner: {coupon.ownerName} | Discount:{" "}
                  {coupon.discountPercentage}% | Benefit:{" "}
                  {coupon.ongoingBenefitPercentage}% | Applications:{" "}
                  {coupon.totalApplications} | Profit: $
                  {coupon.totalProfit.toFixed(2)} | Status:{" "}
                  {coupon.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <span className="text-gray-500">
                {expandedCoupons[coupon.code] ? "▲" : "▼"}
              </span>
            </div>

            {expandedCoupons[coupon.code] && (
              <div className="mt-4 overflow-x-auto">
                <h5 className="font-medium text-gray-700 mb-2">
                  Users who applied this coupon:
                </h5>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupon.referredUsers.map((user, userIndex) => (
                      <tr key={userIndex}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${user.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${user.totalBenefit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
    </div>
  );
};

export default CouponAnalytics;
