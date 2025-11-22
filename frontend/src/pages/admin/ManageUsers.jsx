import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    useTheme,
    Fade,
    Button,
    Menu,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    Inventory as InventoryIcon,
    Warehouse as WarehouseIcon,
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon,
    MoreVert as MoreVertIcon,
    Settings as SettingsIcon,
    Security as SecurityIcon
} from '@mui/icons-material';

const PAGE_SIZE = 10;

const ManageUsers = () => {
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // UI state
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Menu & Dialog State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [newRole, setNewRole] = useState('');

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load users');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Menu Handlers
    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        // Don't clear selectedUser immediately if we are opening a dialog
    };

    const handleOpenRoleDialog = () => {
        setNewRole(selectedUser.role);
        setOpenRoleDialog(true);
        handleMenuClose();
    };

    const handleCloseRoleDialog = () => {
        setOpenRoleDialog(false);
        setSelectedUser(null);
    };

    // Role change handler
    const handleRoleUpdate = async () => {
        if (!selectedUser || !newRole) return;

        try {
            await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
            setSuccess(`Role for ${selectedUser.login_id} updated to ${newRole}`);
            // Refresh list
            const res = await api.get('/admin/users');
            setUsers(res.data);
            handleCloseRoleDialog();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update role');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Filtered and paginated data
    const filtered = users.filter(u => {
        const matchesSearch = u.login_id.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Helper for role colors and icons
    const getRoleConfig = (role) => {
        switch (role) {
            case 'Admin':
                return { color: 'secondary', icon: <AdminIcon fontSize="small" />, label: 'Admin', bg: '#f3e5f5', text: '#7b1fa2' };
            case 'InventoryManager':
                return { color: 'primary', icon: <InventoryIcon fontSize="small" />, label: 'Inventory Manager', bg: '#e3f2fd', text: '#1976d2' };
            case 'WarehouseStaff':
                return { color: 'success', icon: <WarehouseIcon fontSize="small" />, label: 'Warehouse Staff', bg: '#e8f5e9', text: '#388e3c' };
            default:
                return { color: 'default', icon: <PersonIcon fontSize="small" />, label: role, bg: '#f5f5f5', text: '#616161' };
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: 4,
            px: { xs: 2, md: 4 } // Responsive padding
        }}>
            <Box> {/* Removed Container, using Box for full width */}
                {/* Header Section */}
                <Fade in={true} timeout={800}>
                    <Box mb={5}>
                        <Button
                            component={Link}
                            to="/"
                            startIcon={<ArrowBackIcon />}
                            sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                        >
                            Back to Dashboard
                        </Button>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                            <Box>
                                <Typography variant="h3" component="h1" fontWeight="800" sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}>
                                    Manage Users
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Oversee user roles and permissions efficiently.
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchUsers}
                                sx={{ borderRadius: '20px', mt: { xs: 2, md: 0 } }}
                            >
                                Refresh List
                            </Button>
                        </Box>
                    </Box>
                </Fade>

                {/* Stats Cards */}
                <Fade in={true} timeout={1000}>
                    <Grid container spacing={2} mb={4}>
                        {[
                            { title: 'Total Users', count: users.length, color: '#2196f3', icon: <PersonIcon /> },
                            { title: 'Admins', count: users.filter(u => u.role === 'Admin').length, color: '#9c27b0', icon: <AdminIcon /> },
                            { title: 'Inventory Managers', count: users.filter(u => u.role === 'InventoryManager').length, color: '#1976d2', icon: <InventoryIcon /> },
                            { title: 'Warehouse Staff', count: users.filter(u => u.role === 'WarehouseStaff').length, color: '#2e7d32', icon: <WarehouseIcon /> },
                        ].map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                                    transition: 'transform 0.3s',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)' }
                                }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                                        <Avatar sx={{ bgcolor: `${stat.color}22`, color: stat.color, mr: 2, width: 48, height: 48 }}>
                                            {stat.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                                {stat.count}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="500" noWrap>
                                                {stat.title}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Fade>

                {/* Main Content Card */}
                <Fade in={true} timeout={1200}>
                    <Card sx={{
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px 0 rgba(0,0,0,0.05)',
                        overflow: 'visible'
                    }}>
                        <Box p={3} borderBottom="1px solid #f0f0f0">
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search by Login ID or Email..."
                                        value={search}
                                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: '12px', bgcolor: '#f9fafb' }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} gap={2}>
                                        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                                            <InputLabel>Filter by Role</InputLabel>
                                            <Select
                                                value={roleFilter}
                                                onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                                                label="Filter by Role"
                                                sx={{ borderRadius: '12px' }}
                                            >
                                                <MenuItem value="All">All Roles</MenuItem>
                                                <MenuItem value="Admin">Admin</MenuItem>
                                                <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                                                <MenuItem value="WarehouseStaff">Warehouse Staff</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Alerts */}
                        {error && (
                            <Box p={2} bgcolor="#ffebee" color="#c62828" display="flex" alignItems="center" mx={3} mt={2} borderRadius="8px">
                                <Typography variant="body2">{error}</Typography>
                            </Box>
                        )}
                        {success && (
                            <Box p={2} bgcolor="#e8f5e9" color="#2e7d32" display="flex" alignItems="center" mx={3} mt={2} borderRadius="8px">
                                <Typography variant="body2">{success}</Typography>
                            </Box>
                        )}

                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>USER</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>EMAIL</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>CURRENT ROLE</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginated.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                                <Typography variant="h6" color="text.secondary">No users found matching your criteria.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginated.map((user) => {
                                            const roleConfig = getRoleConfig(user.role);
                                            return (
                                                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s' }}>
                                                    <TableCell component="th" scope="row">
                                                        <Box display="flex" alignItems="center">
                                                            <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2, width: 40, height: 40, fontSize: '1rem' }}>
                                                                {user.login_id.slice(0, 2).toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                                                {user.login_id}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {user.email || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={roleConfig.icon}
                                                            label={roleConfig.label}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: roleConfig.bg,
                                                                color: roleConfig.text,
                                                                fontWeight: 600,
                                                                borderRadius: '8px',
                                                                px: 1
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            onClick={(e) => handleMenuClick(e, user)}
                                                            disabled={user.login_id === 'admin001'}
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center" py={3} borderTop="1px solid #f0f0f0">
                                <Box display="flex" gap={1}>
                                    <Button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        variant="outlined"
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Previous
                                    </Button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? 'contained' : 'text'}
                                            onClick={() => setCurrentPage(i + 1)}
                                            sx={{
                                                borderRadius: '8px',
                                                minWidth: '40px',
                                                bgcolor: currentPage === i + 1 ? 'primary.main' : 'transparent',
                                                color: currentPage === i + 1 ? 'white' : 'text.primary'
                                            }}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                        variant="outlined"
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Card>
                </Fade>

                {/* Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        elevation: 3,
                        sx: { borderRadius: '12px', minWidth: '180px' }
                    }}
                >
                    <MenuItem onClick={handleOpenRoleDialog}>
                        <ListItemIcon>
                            <SecurityIcon fontSize="small" />
                        </ListItemIcon>
                        Change Role
                    </MenuItem>
                    {/* Placeholder for future actions */}
                    <MenuItem onClick={handleMenuClose} disabled>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        Edit Details
                    </MenuItem>
                </Menu>

                {/* Role Change Dialog */}
                <Dialog
                    open={openRoleDialog}
                    onClose={handleCloseRoleDialog}
                    PaperProps={{
                        sx: { borderRadius: '16px', p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Change User Role</DialogTitle>
                    <DialogContent sx={{ minWidth: '300px' }}>
                        <DialogContentText sx={{ mb: 3 }}>
                            Select a new role for <strong>{selectedUser?.login_id}</strong>.
                        </DialogContentText>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={newRole}
                                label="Role"
                                onChange={(e) => setNewRole(e.target.value)}
                                sx={{ borderRadius: '12px' }}
                            >
                                <MenuItem value="WarehouseStaff">Warehouse Staff</MenuItem>
                                <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={handleCloseRoleDialog} color="inherit">Cancel</Button>
                        <Button onClick={handleRoleUpdate} variant="contained" sx={{ borderRadius: '8px' }}>
                            Update Role
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Box>
    );
};

export default ManageUsers;
