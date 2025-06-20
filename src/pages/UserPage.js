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
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [revenuePage, setRevenuePage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');
  const pageSize = 10;
  const navigate = useNavigate();

  // Added "Stationery" to revenue activities
  const revenueActivities = [
    'WiFi Hotspot',
    'Cyber Cafe Services',
    'M-Pesa Commission',
    'SIM Registration & Replacement',
    'Stationery'
  ];
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

  // Reset to first page when data or filters change
  useEffect(() => { setRevenuePage(1); }, [revenues, filterDateFrom, filterDateTo, activityFilter]);
  useEffect(() => { setExpensePage(1); }, [expenses, filterDateFrom, filterDateTo, expenseCategoryFilter]);

  const handleRevenueChange = (e) => {
    setRevenueForm({ ...revenueForm, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  // Edit handlers
  const handleEditRevenue = (revenue) => {
    setEditingRevenue(revenue);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleEditRevenueChange = (e) => {
    setEditingRevenue({ ...editingRevenue, [e.target.name]: e.target.value });
  };

  const handleEditExpenseChange = (e) => {
    setEditingExpense({ ...editingExpense, [e.target.name]: e.target.value });
  };

  const handleUpdateRevenue = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/revenues/${editingRevenue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRevenue),
      });
      if (!response.ok) throw new Error('Failed to update revenue');
      const updated = await response.json();
      setRevenues(revenues.map(r => r.id === updated.id ? updated : r));
      setEditingRevenue(null);
      alert('Revenue updated successfully!');
    } catch (error) {
      console.error('Error updating revenue:', error);
      alert('Failed to update revenue. Check console for details.');
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/expenses/${editingExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExpense),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      const updated = await response.json();
      setExpenses(expenses.map(exp => exp.id === updated.id ? updated : exp));
      setEditingExpense(null);
      alert('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Check console for details.');
    }
  };

  const handleCancelEdit = () => {
    setEditingRevenue(null);
    setEditingExpense(null);
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

  // Filtered records for date range and activity/category
  const filteredRevenues = revenues.filter((r) =>
    (!filterDateFrom || r.date >= filterDateFrom) &&
    (!filterDateTo || r.date <= filterDateTo) &&
    (!activityFilter || r.activity === activityFilter)
  );
  const filteredExpenses = expenses.filter((e) =>
    (!filterDateFrom || e.date >= filterDateFrom) &&
    (!filterDateTo || e.date <= filterDateTo) &&
    (!expenseCategoryFilter || e.category === expenseCategoryFilter)
  );

  // Pagination logic
  const revenuePageCount = Math.ceil(filteredRevenues.length / pageSize);
  const expensePageCount = Math.ceil(filteredExpenses.length / pageSize);

  const paginatedRevenues = filteredRevenues.slice((revenuePage - 1) * pageSize, revenuePage * pageSize);
  const paginatedExpenses = filteredExpenses.slice((expensePage - 1) * pageSize, expensePage * pageSize);

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
        {/* Date and activity/category filter controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Show records from:</label>
            <input
              type="date"
              className="p-2 border border-gray-300 rounded-md w-full"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">To:</label>
            <input
              type="date"
              className="p-2 border border-gray-300 rounded-md w-full"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Filter by Revenue Activity:</label>
            <select
              className="p-2 border border-gray-300 rounded-md w-full"
              value={activityFilter}
              onChange={e => setActivityFilter(e.target.value)}
            >
              <option value="">All</option>
              {revenueActivities.map((activity) => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Filter by Expense Category:</label>
            <select
              className="p-2 border border-gray-300 rounded-md w-full"
              value={expenseCategoryFilter}
              onChange={e => setExpenseCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
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
                  <th className="px-4 py-2 text-left text-gray-600">Edit</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRevenues.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-4">
                      {(filterDateFrom || filterDateTo || activityFilter) ? "No records found." : "Please select a date range or filter to view records."}
                    </td>
                  </tr>
                )}
                {paginatedRevenues.map((revenue) =>
                  editingRevenue && editingRevenue.id === revenue.id ? (
                    <tr key={revenue.id} className="border-b border-gray-200 bg-yellow-50">
                      <td className="px-4 py-2">
                        <select
                          name="activity"
                          className="p-1 border rounded"
                          value={editingRevenue.activity}
                          onChange={handleEditRevenueChange}
                        >
                          {revenueActivities.map((activity) => (
                            <option key={activity} value={activity}>{activity}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          name="amount"
                          className="p-1 border rounded w-24"
                          value={editingRevenue.amount}
                          onChange={handleEditRevenueChange}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          name="date"
                          className="p-1 border rounded"
                          value={editingRevenue.date}
                          onChange={handleEditRevenueChange}
                        />
                      </td>
                      <td className="px-4 py-2">{formatTimestamp(editingRevenue.timestamp)}</td>
                      <td className="px-4 py-2">{editingRevenue.shop}</td>
                      <td className="px-4 py-2">{editingRevenue.username}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          name="description"
                          className="p-1 border rounded"
                          value={editingRevenue.description}
                          onChange={handleEditRevenueChange}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={handleUpdateRevenue}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={revenue.id} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-gray-800">{revenue.activity}</td>
                      <td className="px-4 py-2 text-gray-800">{revenue.amount}</td>
                      <td className="px-4 py-2 text-gray-800">{revenue.date}</td>
                      <td className="px-4 py-2 text-gray-800">{formatTimestamp(revenue.timestamp)}</td>
                      <td className="px-4 py-2 text-gray-800">{revenue.shop}</td>
                      <td className="px-4 py-2 text-gray-800">{revenue.username}</td>
                      <td className="px-4 py-2 text-gray-800">{revenue.description || ''}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEditRevenue(revenue)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination controls for revenues */}
          {revenuePageCount > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setRevenuePage(p => Math.max(1, p - 1))}
                disabled={revenuePage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >Prev</button>
              <span className="px-2 py-1">{revenuePage} / {revenuePageCount}</span>
              <button
                onClick={() => setRevenuePage(p => Math.min(revenuePageCount, p + 1))}
                disabled={revenuePage === revenuePageCount}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >Next</button>
            </div>
          )}
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
                  <th className="px-4 py-2 text-left text-gray-600">Edit</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-4">
                      {(filterDateFrom || filterDateTo || expenseCategoryFilter) ? "No records found." : "Please select a date range or filter to view records."}
                    </td>
                  </tr>
                )}
                {paginatedExpenses.map((expense) =>
                  editingExpense && editingExpense.id === expense.id ? (
                    <tr key={expense.id} className="border-b border-gray-200 bg-yellow-50">
                      <td className="px-4 py-2">
                        <select
                          name="category"
                          className="p-1 border rounded"
                          value={editingExpense.category}
                          onChange={handleEditExpenseChange}
                        >
                          {expenseCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          name="amount"
                          className="p-1 border rounded w-24"
                          value={editingExpense.amount}
                          onChange={handleEditExpenseChange}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          name="date"
                          className="p-1 border rounded"
                          value={editingExpense.date}
                          onChange={handleEditExpenseChange}
                        />
                      </td>
                      <td className="px-4 py-2">{formatTimestamp(editingExpense.timestamp)}</td>
                      <td className="px-4 py-2">{editingExpense.shop}</td>
                      <td className="px-4 py-2">{editingExpense.username}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          name="description"
                          className="p-1 border rounded"
                          value={editingExpense.description}
                          onChange={handleEditExpenseChange}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={handleUpdateExpense}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={expense.id} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-gray-800">{expense.category}</td>
                      <td className="px-4 py-2 text-gray-800">{expense.amount}</td>
                      <td className="px-4 py-2 text-gray-800">{expense.date}</td>
                      <td className="px-4 py-2 text-gray-800">{formatTimestamp(expense.timestamp)}</td>
                      <td className="px-4 py-2 text-gray-800">{expense.shop}</td>
                      <td className="px-4 py-2 text-gray-800">{expense.username}</td>
                      <td className="px-4 py-2 text-gray-800">{expense.description || ''}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination controls for expenses */}
          {expensePageCount > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setExpensePage(p => Math.max(1, p - 1))}
                disabled={expensePage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >Prev</button>
              <span className="px-2 py-1">{expensePage} / {expensePageCount}</span>
              <button
                onClick={() => setExpensePage(p => Math.min(expensePageCount, p + 1))}
                disabled={expensePage === expensePageCount}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPage;