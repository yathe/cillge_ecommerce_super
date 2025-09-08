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

const Analytics = () => {
  const { getToken, user } = useAppContext();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/analytics/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setAnalyticsData(data.data);
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
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full p-4 md:p-10 space-y-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
          Analytics Dashboard
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center sm:text-left">
            <h3 className="text-sm sm:text-lg font-medium text-gray-700">
              Total Users
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {analyticsData.totalUsers}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center sm:text-left">
            <h3 className="text-sm sm:text-lg font-medium text-gray-700">
              Coupon Applications
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {analyticsData.totalCouponApplications}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center sm:text-left">
            <h3 className="text-sm sm:text-lg font-medium text-gray-700">
              Total Profit
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">
              ₹{analyticsData.totalProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Bar Chart - Profit by Coupon */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">
            Profit by Coupon
          </h3>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.profitByCoupon}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Earnings per User */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">
            Earnings Distribution by User
          </h3>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.earningsPerUser}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="earnings"
                  label={({ name, earnings }) => `${name}: ₹${earnings}`}
                >
                  {analyticsData.earningsPerUser.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User-Coupon Application Table */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">
            User Coupon Applications
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm md:text-base border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Profit Generated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.userApplications.map((application, index) => (
                  <tr key={index}>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                      {application.userName}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                      {application.couponCode}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600">
                      ₹{application.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Analytics;
