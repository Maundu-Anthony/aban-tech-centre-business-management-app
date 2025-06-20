import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:5000";

function UserPage({ user, onLogout }) {
  const [revenueForm, setRevenueForm] = useState({
    activity: 'WiFi Hotspot',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    shop: '',
    description: '',
  });
  const [expenseForm, setExpenseForm] = useState({
    category: 'Supplies',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    shop: '',
    description: '',
  });
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  const revenueActivities = ['WiFi Hotspot', 'Cyber Cafe Services', 'M-Pesa Commission', 'SIM Registration & Replacement'];
  const expenseCategories = ['Supplies', 'Logistics'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueResponse, expenseResponse, shopsResponse] = await Promise.all([
          fetch(`${API_BASE}/revenues`),
          fetch(`${API_BASE}/expenses`),
          fetch(`${API_BASE}/shops`)
        ]);
        const revenueData = await revenueResponse.json();
        const expenseData = await expenseResponse.json();
        const shopsData = await shopsResponse.json();
        const userIdentifier = user.username || user.email;
        setRevenues(revenueData.filter((r) => r.username === userIdentifier));
        setExpenses(expenseData.filter((e) => e.username === userIdentifier));
        // Assign shop based on user's shopId
        let userShop = '';
        if (user.shopId && shopsData.length) {
          const foundShop = shopsData.find((s) => s.id === user.shopId);
          userShop = foundShop ? foundShop.name : '';
        }
        if (!revenueForm.shop && userShop) setRevenueForm((prev) => ({ ...prev, shop: userShop }));
        if (!expenseForm.shop && userShop) setExpenseForm((prev) => ({ ...prev, shop: userShop }));
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load records.');
      }
    };
    if (user) fetchData();
    // eslint-disable-next-line
  }, [user]);

  const handleRevenueChange = (e) => {
    setRevenueForm({ ...revenueForm, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  const handleRevenueSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/revenues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...revenueForm,
          userId: user.id,
          username: user.username || user.email,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to record revenue');
      const newRevenue = await response.json();
      setRevenues([...revenues, newRevenue]);
      setRevenueForm({
        activity: 'WiFi Hotspot',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        shop: revenueForm.shop,
        description: '',
      });
      alert('Revenue recorded successfully!');
    } catch (error) {
      console.error('Error recording revenue:', error);
      alert('Failed to record revenue. Check console for details.');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          userId: user.id,
          username: user.username || user.email,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to record expense');
      const newExpense = await response.json();
      setExpenses([...expenses, newExpense]);
      setExpenseForm({
        category: 'Supplies',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        shop: expenseForm.shop,
        description: '',
      });
      alert('Expense recorded successfully!');
    } catch (error) {
      console.error('Error recording expense:', error);
      alert('Failed to record expense. Check console for details.');
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const formatTimestamp = (isoString) => {
    return new Date(isoString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!user) return <div className="text-center py-10 text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-indigo-900">
            Revenue & Expense Tracking - {user.username || user.email} at {revenueForm.shop || 'No Shop Assigned'}
          </h1>
          <button
            onClick={handleLogoutClick}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Record Payment/Commission</h2>
            <form onSubmit={handleRevenueSubmit} className="space-y-4">
              <select
                name="activity"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={revenueForm.activity}
                onChange={handleRevenueChange}
                required
              >
                {revenueActivities.map((activity) => (
                  <option key={activity} value={activity}>{activity}</option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                placeholder="Amount (KES)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={revenueForm.amount}
                onChange={handleRevenueChange}
                required
                min="0"
                step="0.01"
              />
              <input
                type="date"
                name="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={revenueForm.date}
                onChange={handleRevenueChange}
                required
              />
              {/* Show assigned shop as read-only */}
              <input
                type="text"
                name="shop"
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                value={revenueForm.shop}
                readOnly
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Short description (optional)"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={revenueForm.description}
                onChange={handleRevenueChange}
                maxLength={100}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Record Payment
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Record Expense</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <select
                name="category"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={expenseForm.category}
                onChange={handleExpenseChange}
                required
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                placeholder="Amount (KES)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                required
                min="0"
                step="0.01"
              />
              <input
                type="date"
                name="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={expenseForm.date}
                onChange={handleExpenseChange}
                required
              />
              {/* Show assigned shop as read-only */}
              <input
                type="text"
                name="shop"
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                value={expenseForm.shop}
                readOnly
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Short description (optional)"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={expenseForm.description}
                onChange={handleExpenseChange}
                maxLength={100}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Record Expense
              </button>
            </form>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Revenue Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-600">Activity</th>
                  <th className="px-4 py-2 text-left text-gray-600">Amount (KES)</th>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Timestamp</th>
                  <th className="px-4 py-2 text-left text-gray-600">Shop</th>
                  <th className="px-4 py-2 text-left text-gray-600">Recorded By</th>
                  <th className="px-4 py-2 text-left text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((revenue) => (
                  <tr key={revenue.id} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-800">{revenue.activity}</td>
                    <td className="px-4 py-2 text-gray-800">{revenue.amount}</td>
                    <td className="px-4 py-2 text-gray-800">{revenue.date}</td>
                    <td className="px-4 py-2 text-gray-800">{formatTimestamp(revenue.timestamp)}</td>
                    <td className="px-4 py-2 text-gray-800">{revenue.shop}</td>
                    <td className="px-4 py-2 text-gray-800">{revenue.username}</td>
                    <td className="px-4 py-2 text-gray-800">{revenue.description || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Expense Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-600">Category</th>
                  <th className="px-4 py-2 text-left text-gray-600">Amount (KES)</th>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Timestamp</th>
                  <th className="px-4 py-2 text-left text-gray-600">Shop</th>
                  <th className="px-4 py-2 text-left text-gray-600">Recorded By</th>
                  <th className="px-4 py-2 text-left text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-800">{expense.category}</td>
                    <td className="px-4 py-2 text-gray-800">{expense.amount}</td>
                    <td className="px-4 py-2 text-gray-800">{expense.date}</td>
                    <td className="px-4 py-2 text-gray-800">{formatTimestamp(expense.timestamp)}</td>
                    <td className="px-4 py-2 text-gray-800">{expense.shop}</td>
                    <td className="px-4 py-2 text-gray-800">{expense.username}</td>
                    <td className="px-4 py-2 text-gray-800">{expense.description || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;