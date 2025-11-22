import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';

const EnterOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    if (!email) {
        return (
            <div className="auth-container">
                <div className="card text-center">
                    <Logo size={48} className="mx-auto mb-4" />
                    <p className="error-msg mb-4">No email provided. Please start over.</p>
                    <Link to="/forgot-password" class="btn btn-primary mt-4">Go Back</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            // Pass reset token to next step
            navigate('/reset-password', { state: { resetToken: response.data.resetToken } });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size={48} />
                    </div>
                    <h2 className="text-2xl font-bold">Enter OTP</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        We sent a 6-digit code to <br /><strong>{email}</strong>
                    </p>
                </div>

                {error && <div className="error-msg mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">OTP Code</label>
                        <input
                            type="text"
                            className="form-input text-center tracking-[0.5em] text-2xl font-mono"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            placeholder="000000"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mt-4">Verify OTP</button>
                </form>

                <div className="text-center mt-4 pt-3 border-t border-gray-100">
                    <Link to="/forgot-password" class="link text-sm font-medium">Resend OTP</Link>
                </div>
            </div>
        </div>
    );
};

export default EnterOTP;
