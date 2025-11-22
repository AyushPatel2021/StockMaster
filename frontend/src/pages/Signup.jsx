import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login_id: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.login_id.length < 6 || formData.login_id.length > 12) {
      setError('Login ID must be between 6 and 12 characters');
      return;
    }

    try {
      const response = await api.post('/auth/signup', {
        login_id: formData.login_id,
        email: formData.email,
        password: formData.password,
      });

      // Store token and user
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="card card-compact">
        <div className="text-center mb-2">
          <div className="flex justify-center mb-2">
            <Logo size={32} />
          </div>
          <h2 className="text-xl font-bold">Create Account</h2>
          <p className="text-gray-500 text-xs mt-0.5">Join StockMaster today</p>
        </div>

        {error && <div className="error-msg mb-3 text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-2">
            <label className="form-label label-compact">Login ID</label>
            <input
              type="text"
              name="login_id"
              className="form-input input-compact"
              placeholder="6-12 chars"
              value={formData.login_id}
              onChange={handleChange}
              required
              minLength="6"
              maxLength="12"
            />
          </div>

          <div className="form-group mb-2">
            <label className="form-label label-compact">Email</label>
            <input
              type="email"
              name="email"
              className="form-input input-compact"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-2">
            <label className="form-label label-compact">Password</label>
            <input
              type="password"
              name="password"
              className="form-input input-compact"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label label-compact">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input input-compact"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-compact mt-2">Create Account</button>
        </form>

        <div className="text-center mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            Already have an account? <Link to="/login" className="link font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
