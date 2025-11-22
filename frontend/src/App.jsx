import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import EnterOTP from './pages/EnterOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import Stock from './pages/Stock';
import MoveHistory from './pages/MoveHistory';
import Settings from './pages/Settings';
import Products from './pages/Products';
import ManageUsers from './pages/admin/ManageUsers';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Layout for authenticated pages
const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Outlet />
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/enter-otp" element={<EnterOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Operations - All Roles */}
                    <Route path="/operations/*" element={
                        <ProtectedRoute>
                            <Operations />
                        </ProtectedRoute>
                    } />

                    {/* Inventory Manager & Admin */}
                    <Route path="/stock" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <Stock />
                        </ProtectedRoute>
                    } />
                    <Route path="/move-history" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <MoveHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/*" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <Settings />
                        </ProtectedRoute>
                    } />

                    {/* Admin Only */}
                    <Route path="/products" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <Products />
                        </ProtectedRoute>
                    } />
                    <Route path="/manage-users" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <ManageUsers />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
