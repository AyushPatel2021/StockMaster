import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login_id: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', formData);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size={48} />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-2">Sign in to your StockMaster account</p>
                </div>

                {error && <div className="error-msg mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Login ID</label>
                        <input
                            type="text"
                            name="login_id"
                            className="form-input"
                            placeholder="Enter your Login ID"
                            value={formData.login_id}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="flex justify-between items-center mb-2">
                            <label className="form-label mb-0">Password</label>
                            <Link to="/forgot-password" class="link text-sm font-medium">Forgot Password?</Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mt-6">Sign In</button>
                </form>

                <div className="text-center mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Don't have an account? <Link to="/signup" className="link font-semibold">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
