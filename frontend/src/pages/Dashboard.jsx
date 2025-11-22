import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                // If auth fails, redirect to login
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow p-4">
                <div className="container flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">StockMaster Dashboard</h1>
                    <button onClick={handleLogout} className="btn btn-outline text-sm">Logout</button>
                </div>
            </nav>

            <main className="container p-8">
                <div className="card max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">Welcome back, {user?.login_id}!</h2>
                    <p className="text-gray-600 mb-8">
                        This is your dashboard. The inventory management features will be available in the next update.
                    </p>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded">
                        <h3 className="font-bold text-blue-800 mb-2">Account Details</h3>
                        <p><strong>Login ID:</strong> {user?.login_id}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
