import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const PAGE_SIZE = 10;

const UserRoles = () => {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all users (including role info)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
                setFiltered(res.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load users');
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Compute role counts for the stats cards
    const roleCounts = users.reduce(
        (acc, u) => {
            acc.total += 1;
            if (u.role === 'Admin') acc.admin += 1;
            else if (u.role === 'InventoryManager') acc.manager += 1;
            else if (u.role === 'WarehouseStaff' || u.role === 'WarehouseStaff') acc.staff += 1;
            else acc.other += 1;
            return acc;
        },
        { total: 0, admin: 0, manager: 0, staff: 0, other: 0 }
    );

    // Apply search and role filter
    useEffect(() => {
        let data = [...users];
        if (search) {
            const term = search.toLowerCase();
            data = data.filter(
                (u) => u.login_id.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
            );
        }
        if (roleFilter !== 'All') {
            data = data.filter((u) => u.role === roleFilter);
        }
        setFiltered(data);
        setCurrentPage(1); // reset page when filter changes
    }, [search, roleFilter, users]);

    // Pagination calculations
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (loading) return <div className="p-8 text-center">Loading roles...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">User Roles Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 text-center">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-indigo-600">{roleCounts.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                    <p className="text-sm text-gray-500">Admins</p>
                    <p className="text-2xl font-semibold text-purple-600">{roleCounts.admin}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                    <p className="text-sm text-gray-500">Inventory Managers</p>
                    <p className="text-2xl font-semibold text-blue-600">{roleCounts.manager}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                    <p className="text-sm text-gray-500">Warehouse Staff</p>
                    <p className="text-2xl font-semibold text-green-600">{roleCounts.staff}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by login or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="InventoryManager">Inventory Manager</option>
                    <option value="WarehouseStaff">Warehouse Staff</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Login ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginated.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {user.login_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : ''}
                      ${user.role === 'InventoryManager' ? 'bg-blue-100 text-blue-800' : ''}
                      ${user.role === 'WarehouseStaff' ? 'bg-green-100 text-green-800' : ''}
                    `}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            <div className="mt-8 text-center text-gray-500 text-sm">
                <Link to="/" className="text-indigo-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default UserRoles;
