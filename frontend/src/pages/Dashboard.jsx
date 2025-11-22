import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
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
                    <p><strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
