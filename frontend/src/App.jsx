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
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ReceiptList from './pages/operations/ReceiptList';
import ReceiptForm from './pages/operations/ReceiptForm';
import DeliveryList from './pages/operations/DeliveryList';
import DeliveryForm from './pages/operations/DeliveryForm';
import TransferList from './pages/operations/TransferList';
import TransferForm from './pages/operations/TransferForm';
import History from './pages/History';
import ManageUsers from './pages/admin/ManageUsers';
import WarehouseList from './pages/settings/WarehouseList';
import WarehouseForm from './pages/settings/WarehouseForm';
import LocationList from './pages/settings/LocationList';
import LocationForm from './pages/settings/LocationForm';
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
                    <Route path="/operations/receipts" element={
                        <ProtectedRoute>
                            <ReceiptList />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/receipts/new" element={
                        <ProtectedRoute>
                            <ReceiptForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/receipts/:id" element={
                        <ProtectedRoute>
                            <ReceiptForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/deliveries" element={
                        <ProtectedRoute>
                            <DeliveryList />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/deliveries/new" element={
                        <ProtectedRoute>
                            <DeliveryForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/deliveries/:id" element={
                        <ProtectedRoute>
                            <DeliveryForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/transfers" element={
                        <ProtectedRoute>
                            <TransferList />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/transfers/new" element={
                        <ProtectedRoute>
                            <TransferForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/operations/transfers/:id" element={
                        <ProtectedRoute>
                            <TransferForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/move-history" element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    } />
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
                    {/* Settings Routes */}
                    <Route path="/settings" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <Settings />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/warehouse" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <WarehouseList />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/warehouse/new" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <WarehouseForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/warehouse/edit/:id" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <WarehouseForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/location" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <LocationList />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/location/new" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <LocationForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/location/edit/:id" element={
                        <ProtectedRoute allowedRoles={['InventoryManager', 'Admin']}>
                            <LocationForm />
                        </ProtectedRoute>
                    } />

                    {/* Admin Only */}
                    <Route path="/products" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <ProductList />
                        </ProtectedRoute>
                    } />
                    <Route path="/products/new" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <ProductForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/products/edit/:id" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <ProductForm />
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
