import React, { useState, useEffect } from 'react';
import AdminLayout from '../shared/AdminLayout';
import { FaMoneyBill, FaBook, FaTablet, FaUtensils, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const IncomeManagement = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [incomeData, setIncomeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [statistics, setStatistics] = useState({
    totalEarnings: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTransactions: 0,
    totalCoins: 0
  });

  const COLORS = ['#3b82f6', '#d91010', '#f59e0b'];

  useEffect(() => {
    fetchIncomeData();
  }, [dateRange, filterType]);

  const fetchIncomeData = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get('https://rmrbdapi.somee.com/odata/Cointransaction', {
        headers: {
          'Token': '123-abc',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data) {
        console.error('No data received from API');
        setIsLoading(false);
        return;
      }

      console.log('API Response:', response.data);
      
      const transactions = response.data;

      if (transactions.length === 0) {
        setStatistics({
          totalEarnings: 0,
          totalExpenses: 0,
          netProfit: 0,
          totalTransactions: 0,
          totalCoins: 0
        });
        setIncomeData([]);
        setIsLoading(false);
        return;
      }

      const totalEarnings = transactions
        .filter(t => t && t.moneyFluctuations && t.moneyFluctuations > 0)
        .reduce((sum, t) => sum + t.moneyFluctuations, 0);

      const totalExpenses = transactions
        .filter(t => (t && t.moneyFluctuations && t.moneyFluctuations < 0) || 
                    (t && t.coinFluctuations && t.coinFluctuations < 0))
        .reduce((sum, t) => sum + (t.moneyFluctuations || 0) + (t.coinFluctuations || 0), 0);

      const totalCoins = transactions
        .filter(t => t && t.coinFluctuations && t.coinFluctuations > 0)
        .reduce((sum, t) => sum + t.coinFluctuations, 0);

      setStatistics({
        totalEarnings,
        totalExpenses,
        netProfit: totalEarnings + totalExpenses,
        totalTransactions: transactions.length,
        totalCoins
      });

      const monthlyData = transactions.reduce((acc, transaction) => {
        if (!transaction || !transaction.date) return acc;
        
        const month = new Date(transaction.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = {
            month,
            earnings: 0,
            expenses: 0,
            coins: 0
          };
        }
        
        if (transaction.moneyFluctuations) {
          if (transaction.moneyFluctuations > 0) {
            acc[month].earnings += transaction.moneyFluctuations;
          } else {
            acc[month].expenses += Math.abs(transaction.moneyFluctuations);
          }
        }
        
        if (transaction.coinFluctuations) {
          if (transaction.coinFluctuations > 0) {
            acc[month].coins += transaction.coinFluctuations;
          } else {
            acc[month].expenses += Math.abs(transaction.coinFluctuations);
          }
        }
        
        return acc;
      }, {});

      setIncomeData(Object.values(monthlyData));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching income data:', error);
      setStatistics({
        totalEarnings: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalTransactions: 0,
        totalCoins: 0
      });
      setIncomeData([]);
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, color, isCurrency = true }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <span className={`text-xl font-semibold ${color}`}>
          {typeof value === 'number' 
            ? (isCurrency 
                ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                : value.toLocaleString())
            : value}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Quản Lý Thu Nhập">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản Lý Thu Nhập">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="Chọn khoảng thời gian"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {/* <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất Cả Sản Phẩm</option>
              <option value="book">Chỉ Sách</option>
              <option value="ebook">Chỉ E-book</option>
              <option value="recipe">Chỉ Công Thức</option>
            </select> */}
          </div>
          {/* <button
            onClick={() => console.log('Exporting...')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload /> Xuất Excel
          </button> */}
        </div>

        {/* Updated Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Tổng Thu Nhập"
            value={statistics.totalEarnings}
            color="text-blue-600"
          />
          <StatCard
            title="Tổng Xu Đã Rút"
            value={statistics.totalExpenses}
            color="text-red-600"
          />
          <StatCard
            title="Lợi Nhuận"
            value={statistics.netProfit}
            color="text-green-600"
          />
          <StatCard
            title="Tổng Giao Dịch"
            value={statistics.totalTransactions}
            color="text-gray-800"
            isCurrency={false}
          />
          <StatCard
            title="Tổng Coin"
            value={`${statistics.totalCoins.toLocaleString()} Coin`}
            color="text-yellow-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Thu Nhập Theo Tháng</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} />
                  <Legend />
                  <Bar dataKey="earnings" name="Thu Nhập" fill="#3b82f6" />
                  <Bar dataKey="expenses" name="Xu đã rút" fill="#d91010" />
                  <Bar dataKey="coins" name="Coin" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Phân Bố Thu Nhập</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Thu Nhập', value: statistics.totalEarnings },
                      { name: 'Xu đã rút', value: Math.abs(statistics.totalExpenses) },
                      { name: 'Coin', value: statistics.totalCoins }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Income Details Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Chi Tiết Thu Nhập</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thu Nhập</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xu đã rút</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomeData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.earnings.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {`-${item.expenses.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.coins.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item.earnings - item.expenses + item.coins).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default IncomeManagement;