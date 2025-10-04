"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"; // charting library
import { useAppContext } from "@/context/AppContext"; // global context
import axios from "axios"; // API calls
import { DollarSign, Users, TrendingUp, Calendar, X } from "lucide-react"; // icons

// Component to show referral benefits data
const BenefitsDisplay = ({ isModal = false, onClose = () => {} }) => {
  // Extract values from global context
  const { getToken, user, currency } = useAppContext();

  // Local states
  const [benefitsData, setBenefitsData] = useState(null); // fetched benefits data
  const [loading, setLoading] = useState(true); // loading state for skeleton UI

  // Fetch referral benefits from backend
  const fetchBenefits = async () => {
    if (!user) return; // do nothing if not logged in

    try {
      // get token for authenticated request
      const token = await getToken();

      // call API
      const { data } = await axios.get("/api/coupon/my-benefits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // if request succeeds, save data
      if (data.success) {
        setBenefitsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch benefits:", error);
    } finally {
      setLoading(false); // stop loader regardless of success/failure
    }
  };

  // Effect: fetch benefits initially and refresh every 30s
  useEffect(() => {
    fetchBenefits();
    const interval = setInterval(fetchBenefits, 30000); // auto refresh
    return () => clearInterval(interval); // cleanup interval
  }, [user]);

  // Loading skeleton UI
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If no referred users yet
  if (!benefitsData || benefitsData.referredUsers.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <Users className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <p className="text-sm text-yellow-700">No referral benefits yet</p>
          <p className="text-xs text-yellow-600 mt-1">
            Share your coupon code to start earning benefits
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for bar chart (per-user data)
  const barChartData = benefitsData.referredUsers.map((user, index) => ({
    name: user.name || user.email || "Unnamed User",
    benefits: user.totalBenefit, // your earned benefit
    spent: user.totalSpent, // total spent by user
    purchases: user.purchaseCount, // purchase count
  }));

  // Prepare data for pie chart (distribution of benefits vs total spent)
  const pieChartData = [
    { name: "Your Benefits", value: benefitsData.totalBenefits },
    {
      name: "Total Spent by Users",
      value:
        benefitsData.referredUsers.reduce(
          (acc, user) => acc + user.totalSpent,
          0
        ) - benefitsData.totalBenefits,
    },
  ];

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div
      className={`bg-white rounded-lg shadow-xl border p-4 ₹{
        isModal ? "w-full max-w-4xl max-h-[90vh] overflow-y-auto" : "w-full"
      }`}
    >
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-xl">Referral Benefits Dashboard</h3>
        {/* Close button if inside modal */}
        {isModal && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ---------- Summary Stats ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Number of referred users */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">Referred Users</p>
              <p className="text-xl font-semibold">
                {benefitsData.referredUsers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Total purchases */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
            <div>
              <p className="text-sm text-purple-800">Total Purchases</p>
              <p className="text-xl font-semibold">
                {benefitsData.referredUsers.reduce(
                  (acc, user) => acc + user.purchaseCount,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Your total earned benefits */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3 text-green-600">
              <p>₹</p>
            </div>
            <div>
              <p className="text-sm text-green-800">Your Total Benefits</p>
              <p className="text-xl font-semibold">
                {currency}
                {benefitsData.totalBenefits.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- How it works ---------- */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-800 mb-2">How It Works:</h4>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>
            When someone uses your coupon, they get a 5% discount on their first
            purchase
          </li>
          <li>You earn 2% of all their future purchases as ongoing benefits</li>
          <li>The chart below shows your earnings from each referred user</li>
        </ul>
      </div>

      {/* ---------- Bar Chart (user-wise benefits) ---------- */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">
          Benefits by Referred User
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {/* Tooltip for hover values */}
              <Tooltip
                formatter={(value, name) => {
                  if (name === "benefits")
                    return [`₹${value.toFixed(2)}`, "Your Benefits"];
                  if (name === "spent")
                    return [`${currency}${value.toFixed(2)}`, "Total Spent"];
                  return [value, "Purchases"];
                }}
              />
              <Legend />
              <Bar dataKey="benefits" fill="#8884d8" name="Your Benefits" />
              <Bar dataKey="spent" fill="#82ca9d" name="Total Spent by User" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- Detailed User Table ---------- */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Detailed User Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {user?.name || user?.email}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchases
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Benefits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benefit Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map each referred user */}
              {benefitsData.referredUsers.map((user, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user?.name || user?.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.purchaseCount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currency}
                    {user.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {currency}
                    {user.totalBenefit.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.totalSpent > 0
                      ? ((user.totalBenefit / user.totalSpent) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Pie Chart ---------- */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Earnings Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {/* Assign colors to slices */}
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- Footer Note ---------- */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <Calendar className="w-4 h-4 inline mr-1" />
        Updated automatically with each purchase
      </div>
    </div>
  );
};

export default BenefitsDisplay;
