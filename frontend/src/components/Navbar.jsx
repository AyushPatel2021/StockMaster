import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOperationsOpen, setIsOperationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;
    const isSectionActive = (pathPrefix) => location.pathname.startsWith(pathPrefix);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-indigo-500">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    >
                        <Logo size={32} />
                        <span className="text-xl font-bold text-gray-800">StockMaster</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center space-x-1">
                        {/* Dashboard */}
                        <Link
                            to="/dashboard"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/dashboard')
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                        >
                            Dashboard
                        </Link>

                        {/* Operations Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOperationsOpen(!isOperationsOpen)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 ${isSectionActive('/operations')
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                            >
                                Operations
                                <svg className={`w-4 h-4 transition-transform ${isOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {isOperationsOpen && (
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[9999] transition-all duration-200 ease-out animate-fadeIn">
                                    <div className="py-1">
                                        <Link
                                            to="/operations/receipts"
                                            onClick={() => setIsOperationsOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                        >
                                            <span className="block">Receipts</span>
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <Link
                                            to="/operations/deliveries"
                                            onClick={() => setIsOperationsOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                        >
                                            <span className="block">Deliveries</span>
                                        </Link>

                                        <div className="border-t border-gray-100 my-1"></div>
                                        <Link
                                            to="/operations/adjustment"
                                            onClick={() => setIsOperationsOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                        >
                                            <span className="block">Adjustment</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Inventory Manager & Admin Links */}
                        {(user.role === 'InventoryManager' || user.role === 'Admin') && (
                            <>
                                <Link
                                    to="/stock"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/stock')
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    Stock
                                </Link>

                                <Link
                                    to="/move-history"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/move-history')
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    History
                                </Link>
                            </>
                        )}

                        {/* Admin Only Links */}
                        {user.role === 'Admin' && (
                            <>
                                <Link
                                    to="/products"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/products')
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    Products
                                </Link>
                                <Link
                                    to="/manage-users"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/manage-users')
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    Users
                                </Link>

                                {/* Settings Dropdown - Admin Only */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 ${isSectionActive('/settings')
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        Settings
                                        <svg className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isSettingsOpen && (
                                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[9999] transition-all duration-200 ease-out animate-fadeIn">
                                            <div className="py-1">
                                                <Link
                                                    to="/settings/warehouse"
                                                    onClick={() => setIsSettingsOpen(false)}
                                                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                                >
                                                    <span className="block">Warehouse</span>
                                                </Link>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <Link
                                                    to="/settings/location"
                                                    onClick={() => setIsSettingsOpen(false)}
                                                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                                >
                                                    <span className="block">Locations</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Logout Button */}
                    <div className="hidden sm:flex items-center">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="sm:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden border-t border-gray-200 bg-gray-50">
                    <div className="px-4 py-3 space-y-2">
                        {/* User Info */}
                        <div className="pb-3 border-b border-gray-200">
                            <div className="text-sm font-semibold text-gray-800">{user.login_id}</div>
                            <div className="text-xs text-gray-500">{user.role}</div>
                        </div>

                        <Link
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                        >
                            Dashboard
                        </Link>

                        <div className="text-xs font-semibold text-gray-500 px-3 pt-2">OPERATIONS</div>
                        <Link
                            to="/operations/receipt"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                        >
                            Receipt
                        </Link>

                        <Link
                            to="/operations/adjustment"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                        >
                            Adjustment
                        </Link>

                        {(user.role === 'InventoryManager' || user.role === 'Admin') && (
                            <>
                                <Link
                                    to="/stock"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                                >
                                    Stock
                                </Link>
                                <Link
                                    to="/move-history"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                                >
                                    History
                                </Link>

                                <div className="text-xs font-semibold text-gray-500 px-3 pt-2">SETTINGS</div>
                                <Link
                                    to="/settings/warehouse"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                                >
                                    Warehouse
                                </Link>
                                <Link
                                    to="/settings/location"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                                >
                                    Locations
                                </Link>
                            </>
                        )}

                        {user.role === 'Admin' && (
                            <>
                                <Link
                                    to="/products"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                                >
                                    Products
                                </Link>
                                <Link
                                    to="/manage-users"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
                                >
                                    Users
                                </Link>
                            </>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full mt-3 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;