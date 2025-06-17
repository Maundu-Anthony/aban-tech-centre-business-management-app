import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Authentication({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    shopId: '',
  });
  const [shops, setShops] = useState([]);
  const navigate = useNavigate();

  // Fetch shops for registration dropdown
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('http://localhost:5000/shops');
        const data = await response.json();
        setShops(data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };
    fetchShops();
  }, []);

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setForm({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      shopId: '',
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering && form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const url = isRegistering
      ? 'http://localhost:5000/users'
      : 'http://localhost:5000/login';

    try {
      if (isRegistering) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            username: form.username,
            password: form.password,
            role: 'user',
            shopId: form.shopId,
          }),
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        await response.json();
        alert('Registration successful! Please log in.');
        toggleMode();
      } else {
        const response = await fetch(
          `http://localhost:5000/users?email=${form.email}&password=${form.password}&role=${form.role}`
        );
        const users = await response.json();

        if (users.length === 0) {
          alert('Invalid email, password, or role');
          return;
        }

        const user = users[0];

        // Prevent login and success message if user is fired
        if (user.status === 'fired') {
          alert('Your account has been deactivated. Please contact the admin.');
          return;
        }

        onLogin(user);
        alert(`Login successful! Welcome ${user.username || user.email} (${user.role})`);
        navigate(user.role === 'admin' ? '/admin' : '/user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Aban-Tech Centre Business Management System
        </h1>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? 'Create Account' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRegistering && (
            <select
              name="role"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.email}
            onChange={handleChange}
            required
          />
          {isRegistering && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.username}
                onChange={handleChange}
                required
              />
              <select
                name="shopId"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.shopId}
                onChange={handleChange}
                required
              >
                <option value="">Select Shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </>
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.password}
            onChange={handleChange}
            required
          />
          {isRegistering && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:underline font-semibold"
          >
            {isRegistering ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Authentication;