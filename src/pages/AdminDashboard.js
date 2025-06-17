import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Rent',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    shop: '',
    description: '',
  });
  // Removed unused state variables
  // const [revenueDescriptions, setRevenueDescriptions] = useState({});
  // const [expenseDescriptions, setExpenseDescriptions] = useState({});
  const [selectedShop, setSelectedShop] = useState('');
  const [newShop, setNewShop] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const navigate = useNavigate();
  const adminExpenseCategories = ['Rent', 'Internet Subscription', 'Utilities'];

  // Block fired users from accessing the dashboard
  useEffect(() => {
    if (user && user.status === "fired") {
      alert("Your account has been deactivated. Please contact the admin.");
      onLogout();
      navigate('/login');
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseResponse, usersResponse, revenueResponse, shopsResponse] = await Promise.all([
          fetch('http://localhost:5000/expenses'),
          fetch('http://localhost:5000/users'),
          fetch('http://localhost:5000/revenues'),
          fetch('http://localhost:5000/shops'),
        ]);
        const expenseData = await expenseResponse.json();
        const usersData = await usersResponse.json();
        const revenueData = await revenueResponse.json();
        const shopsData = shopsResponse.ok ? await shopsResponse.json() : [];
        setExpenses(expenseData);
        setUsers(usersData);
        setRevenues(revenueData);
        setShops(shopsData);

        // Set default selected shop to first active shop
        const activeShops = shopsData.filter((s) => s.status === "active");
        if (activeShops.length && !selectedShop) {
          setSelectedShop(activeShops[0].name);
          setExpenseForm((prev) => ({ ...prev, shop: activeShops[0].name }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load records.');
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Update expense form shop when selectedShop changes
  useEffect(() => {
    if (selectedShop) {
      setExpenseForm((prev) => ({ ...prev, shop: selectedShop }));
    }
  }, [selectedShop]);

  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          userId: user.id,
          username: user.email,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to record expense');
      const newExpense = await response.json();
      setExpenses([...expenses, newExpense]);
      setExpenseForm({
        category: 'Rent',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        shop: selectedShop || '',
        description: '',
      });
      alert('Expense recorded successfully!');
    } catch (error) {
      console.error('Error recording expense:', error);
      alert('Failed to record expense. Check console for details.');
    }
  };

  // Create Shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShop.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShop.trim(), status: "active" }),
      });
      if (!response.ok) throw new Error('Failed to create shop');
      const createdShop = await response.json();
      setShops((prev) => [...prev, createdShop]);
      setNewShop('');
      alert('Shop created successfully!');
    } catch (error) {
      console.error('Error creating shop:', error);
      alert('Failed to create shop. Check console for details.');
    }
  };

  // Classify user as active/fired
  const handleUserStatusChange = async (userId, status) => {
    try {
      await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
    } catch (error) {
      alert('Failed to update user status.');
    }
  };

  // Classify shop as active/closed
  const handleShopStatusChange = async (shopName, status) => {
    try {
      const shopObj = shops.find((s) => s.name === shopName);
      if (shopObj) {
        await fetch(`http://localhost:5000/shops/${shopObj.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        setShops(shops.map(s => s.name === shopName ? { ...s, status } : s));
      }
    } catch (error) {
      alert('Failed to update shop status.');
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

  // Filtered records for selected shop and filterDate
  const filteredRevenues = revenues.filter((r) =>
    r.shop === selectedShop &&
    filterDate && r.date >= filterDate // Only show if filterDate is set
  );
  const filteredExpenses = expenses.filter((e) =>
    e.shop === selectedShop &&
    filterDate && e.date >= filterDate // Only show if filterDate is set
  );

  // Totals
  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-indigo-900">Admin Dashboard - {user.email}</h1>
          <button
            onClick={handleLogoutClick}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
        {/* Shop selector and date filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Select Shop</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            value={selectedShop}
            onChange={e => setSelectedShop(e.target.value)}
          >
            {shops.filter(s => s.status === "active").map((shop) => (
              <option key={shop.id} value={shop.name}>{shop.name}</option>
            ))}
          </select>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Show records from:</label>
            <input
              type="date"
              className="p-2 border border-gray-300 rounded-md"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="bg-indigo-100 p-4 rounded flex-1 text-center">
              <div className="text-lg text-gray-700 font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-indigo-800">{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-red-100 p-4 rounded flex-1 text-center">
              <div className="text-lg text-gray-700 font-medium">Total Expenses</div>
              <div className="text-2xl font-bold text-red-800">{totalExpense.toLocaleString()}</div>
            </div>
            <div className="bg-green-100 p-4 rounded flex-1 text-center">
              <div className="text-lg text-gray-700 font-medium">Profit</div>
              <div className="text-2xl font-bold text-green-800">{totalProfit.toLocaleString()}</div>
            </div>
          </div>
        </div>
        {/* Revenue Table */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Revenues for {selectedShop}</h2>
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
                {filteredRevenues.map((revenue) => (
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
        {/* Expenses Table */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Expenses for {selectedShop}</h2>
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
                {filteredExpenses.map((expense) => (
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
        {/* Record Expense */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Record Expense</h2>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <select
              name="category"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={expenseForm.category}
              onChange={handleExpenseChange}
              required
            >
              {adminExpenseCategories.map((category) => (
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
            <input
              type="text"
              name="shop"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              value={selectedShop}
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
        {/* Manage Users */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-600">Email</th>
                  <th className="px-4 py-2 text-left text-gray-600">Role</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-800">{u.email}</td>
                    <td className="px-4 py-2 text-gray-800">{u.role}</td>
                    <td className="px-4 py-2 text-gray-800">{u.status || "active"}</td>
                    <td className="px-4 py-2">
                      <select
                        value={u.status || "active"}
                        onChange={e => handleUserStatusChange(u.id, e.target.value)}
                        className="border rounded p-1"
                        disabled={u.email === user.email}
                      >
                        <option value="active">Active</option>
                        <option value="fired">Fired</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Manage Shops */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Manage Shops</h2>
          {/* Shop creation form */}
          <form onSubmit={handleCreateShop} className="flex mb-4 gap-2">
            <input
              type="text"
              placeholder="New Shop Name"
              className="flex-1 p-2 border border-gray-300 rounded-md"
              value={newShop}
              onChange={(e) => setNewShop(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Add Shop
            </button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-600">Shop Name</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-800">{shop.name}</td>
                    <td className="px-4 py-2 text-gray-800">{shop.status || "active"}</td>
                    <td className="px-4 py-2">
                      <select
                        value={shop.status || "active"}
                        onChange={e => handleShopStatusChange(shop.name, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
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

export default AdminDashboard;