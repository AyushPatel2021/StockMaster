import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resetToken = location.state?.resetToken;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!resetToken) {
        return (
            <div className="auth-container">
                <div className="card text-center">
                    <Logo size={48} className="mx-auto mb-4" />
                    <p className="error-msg mb-4">Unauthorized access. Please start over.</p>
                    <Link to="/forgot-password" class="btn btn-primary mt-4">Go Back</Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await api.post('/auth/reset-password', {
                resetToken,
                newPassword: formData.newPassword,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="card text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">✓</div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Success!</h2>
                    <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                    <Link to="/login" className="btn btn-primary btn-block mt-6">Login Now</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size={48} />
                    </div>
                    <h2 className="text-2xl font-bold">Set New Password</h2>
                    <p className="text-gray-500 text-sm mt-2">Create a strong password for your account</p>
                </div>

                {error && <div className="error-msg mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="form-input"
                            placeholder="New password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mt-4">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
