import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await api.post('/auth/request-otp', { email });
            // Pass email to next step
            navigate('/enter-otp', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size={48} />
                    </div>
                    <h2 className="text-2xl font-bold">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Enter your email address and we'll send you an OTP to reset your password.
                    </p>
                </div>

                {error && <div className="error-msg mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mt-4" disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>

                <div className="text-center mt-4 pt-3 border-t border-gray-100">
                    <Link to="/login" className="link text-sm font-medium">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
