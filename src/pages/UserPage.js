import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserPage({ user, onLogout }) {
  const [form, setForm] = useState({
    activity: 'WiFi Hotspot',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [revenues, setRevenues] = useState([]);
  const navigate = useNavigate();

  const activities = ['WiFi Hotspot', 'Cyber Cafe Services', 'M-Pesa Commission', 'SIM Registration & Replacement'];

  // Fetch existing revenue records
  useEffect(() => {
    const fetchRevenues = async () => {
      try {
        const response = await fetch('http://localhost:5000/revenues');
        const data = await response.json();
        setRevenues(data);
      } catch (error) {
        console.error('Error fetching revenues:', error);
        alert('Failed to load revenue records.');
      }
    };
    fetchRevenues();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/revenues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          userId: user.id,
          username: user.username || user.email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record revenue');
      }

      const newRevenue = await response.json();
      setRevenues([...revenues, newRevenue]);
      setForm({
        activity: 'WiFi Hotspot',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
      alert('Revenue recorded successfully!');
    } catch (error) {
      console.error('Error recording revenue:', error);
      alert('Failed to record revenue. Check console for details.');
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700">
            Revenue Tracking - {user.username || user.email} (User)
          </h1>
          <button
            onClick={handleLogoutClick}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Record Payment/Commission</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="activity"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.activity}
              onChange={handleChange}
              required
            >
              {activities.map((activity) => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
            <input
              type="number"
              name="amount"
              placeholder="Amount (KES)"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
            <input
              type="date"
              name="date"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.date}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Record Payment/Commission
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Revenue Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-600">Activity</th>
                  <th className="px-4 py-2 text-left text-gray-600">Amount (KES)</th>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((revenue) => (
                  <tr key={revenue.id} className="border-b">
                    <td className="px-4 py-2">{revenue.activity}</td>
                    <td className="px-4 py-2">{revenue.amount}</td>
                    <td className="px-4 py-2">{revenue.date}</td>
                    <td className="px-4 py-2">{revenue.username}</td>
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