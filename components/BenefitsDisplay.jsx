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
} from "recharts";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  X,
  Package,
} from "lucide-react";

const BenefitsDisplay = ({ isModal = false, onClose = () => {} }) => {
  const { getToken, user, currency } = useAppContext();
  const [benefitsData, setBenefitsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch referral benefits from backend
  const fetchBenefits = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const { data } = await axios.get("/api/coupon/my-benefits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBenefitsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch benefits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
    const interval = setInterval(fetchBenefits, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Loading skeleton UI
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If no referred users yet
  if (!benefitsData || benefitsData.referredUsers.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <Users className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-800 mb-2">
            No Referral Benefits Yet
          </p>
          <p className="text-sm text-yellow-700">
            Share your coupon code with friends to start earning benefits from
            their purchases
          </p>
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-xs text-yellow-800">
              You'll earn 2% of every purchase made by users who apply your
              coupon
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for bar chart (per-user data)
  const barChartData = benefitsData.referredUsers.map((user, index) => ({
    name: user.userName || user.email || `User ${index + 1}`,
    benefits: user.totalBenefit,
    spent: user.totalSpent,
    purchases: user.purchaseCount,
  }));

  // Prepare data for pie chart
  const totalSpentByUsers = benefitsData.referredUsers.reduce(
    (acc, user) => acc + user.totalSpent,
    0
  );

  const pieChartData = [
    {
      name: "Your Benefits",
      value: benefitsData.totalBenefits,
    },
    {
      name: "Total Spent by Users",
      value: totalSpentByUsers - benefitsData.totalBenefits,
    },
  ];

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div
      className={`bg-white rounded-lg shadow-xl border p-6 ${
        isModal ? "w-full max-w-6xl max-h-[90vh] overflow-y-auto" : "w-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Referral Benefits Dashboard
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track your earnings from coupon referrals
          </p>
        </div>
        {isModal && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 mr-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Referred Users
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {benefitsData.referredUsers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800">
                Total Purchases
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {benefitsData.referredUsers.reduce(
                  (acc, user) => acc + user.purchaseCount,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 mr-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Total Benefits
              </p>
              <p className="text-2xl font-bold text-green-900">
                {currency}
                {benefitsData.totalBenefits.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          How It Works
        </h4>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
          <li>
            When someone uses your coupon, they get a 5% discount on their first
            purchase
          </li>
          <li>You earn 2% of all their future purchases as ongoing benefits</li>
          <li>Each coupon can only be used by one unique user</li>
          <li>
            Benefits are automatically calculated and updated with each purchase
          </li>
        </ul>
      </div>

      {/* Bar Chart */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">
          Benefits by Referred User
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "benefits")
                    return [`${currency}${value.toFixed(2)}`, "Your Benefits"];
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

      {/* Detailed User Table */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Detailed User Breakdown</h4>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Benefits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benefit Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products Purchased
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {benefitsData.referredUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.userName || user.email || `User ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">{user.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.purchaseCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {currency}
                    {user.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {currency}
                    {user.totalBenefit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.totalSpent > 0
                        ? ((user.totalBenefit / user.totalSpent) * 100).toFixed(
                            1
                          )
                        : 0}
                      %
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {user.products && user.products.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.products.map((product, productIndex) => (
                          <span
                            key={productIndex}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {product.name || product}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        No product data
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Earnings Distribution</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${currency}${value.toFixed(2)}`,
                  "Amount",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          Updated automatically with each purchase • Last updated:{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default BenefitsDisplay;
