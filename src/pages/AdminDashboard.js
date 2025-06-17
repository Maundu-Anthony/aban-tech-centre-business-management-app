import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user, onLogout }) {
  const [revenues, setRevenues] = useState([]);
  const navigate = useNavigate();
  const activities = ['WiFi Hotspot', 'Cyber Cafe Services', 'M-Pesa Commission', 'SIM Registration & Replacement'];

  // Fetch revenue records
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

  // Calculate totals
  const totals = activities.reduce((acc, activity) => {
    acc[activity] = revenues
      .filter((r) => r.activity === activity)
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    return acc;
  }, {});
  const overallTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700">
            Admin Dashboard - {user.email} (Admin)
          </h1>
          <button
            onClick={handleLogoutClick}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Revenue Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activities.map((activity) => (
              <div key={activity} className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700">{activity}</h3>
                <p className="text-2xl font-bold text-blue-600">KES {totals[activity].toFixed(2)}</p>
              </div>
            ))}
            <div className="bg-blue-100 p-4 rounded-xl col-span-1 sm:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">KES {overallTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All Revenue Records</h2>
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

export default AdminDashboard;