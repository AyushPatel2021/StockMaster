import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    CircularProgress,
    Fade,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    CallReceived as ReceiptIcon,
    LocalShipping as DeliveryIcon,
    SwapHoriz as TransferIcon,
    Add as AddIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/dashboard/stats');
            setStats(response.data);
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    const StatCard = ({ title, value, icon, color, subtext }) => (
        <Paper
            sx={{
                p: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`,
                color: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>{title}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>{value}</Typography>
                    {subtext && <Typography variant="body2" sx={{ opacity: 0.8 }}>{subtext}</Typography>}
                </Box>
                <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                    {icon}
                </Box>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            <Fade in={true}>
                <Box>
                    {/* Hero Section */}
                    <Box mb={5}>
                        <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
                            Dashboard
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Overview of your inventory performance
                        </Typography>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={3} mb={5}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Products"
                                value={stats?.totalProducts || 0}
                                icon={<InventoryIcon fontSize="large" />}
                                color={['#4F46E5', '#818CF8']} // Indigo
                                subtext="Active items in catalog"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Low Stock"
                                value={stats?.lowStockCount || 0}
                                icon={<WarningIcon fontSize="large" />}
                                color={['#DC2626', '#F87171']} // Red
                                subtext="Items below minimum"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Pending Receipts"
                                value={stats?.pendingReceipts || 0}
                                icon={<ReceiptIcon fontSize="large" />}
                                color={['#059669', '#34D399']} // Emerald
                                subtext="Inbound orders to process"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Pending Deliveries"
                                value={stats?.pendingDeliveries || 0}
                                icon={<DeliveryIcon fontSize="large" />}
                                color={['#D97706', '#FBBF24']} // Amber
                                subtext="Outbound orders to ship"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={4}>
                        {/* Recent Activity */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                                    <Button onClick={() => navigate('/move-history')}>View All</Button>
                                </Box>
                                <List>
                                    {stats?.recentActivity?.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar sx={{
                                                        bgcolor: item.type === 'receipt' ? 'success.light' :
                                                            item.type === 'delivery' ? 'primary.light' : 'warning.light',
                                                        color: 'white'
                                                    }}>
                                                        {item.type === 'receipt' ? <ReceiptIcon /> :
                                                            item.type === 'delivery' ? <DeliveryIcon /> : <TransferIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography fontWeight="500">
                                                            {item.reference}
                                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                                ({item.type.toUpperCase()})
                                                            </Typography>
                                                        </Typography>
                                                    }
                                                    secondary={new Date(item.created_at).toLocaleDateString() + ' • ' + item.status.toUpperCase()}
                                                />
                                            </ListItem>
                                            {index < stats.recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                                        </React.Fragment>
                                    ))}
                                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                                        <Typography color="text.secondary" align="center" py={3}>No recent activity</Typography>
                                    )}
                                </List>
                            </Paper>
                        </Grid>

                        {/* Quick Actions */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>Quick Actions</Typography>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<ReceiptIcon />}
                                        onClick={() => navigate('/operations/receipts/new')}
                                        sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, borderColor: 'grey.300', color: 'text.primary' }}
                                    >
                                        New Receipt
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<DeliveryIcon />}
                                        onClick={() => navigate('/operations/deliveries/new')}
                                        sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, borderColor: 'grey.300', color: 'text.primary' }}
                                    >
                                        New Delivery
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<TransferIcon />}
                                        onClick={() => navigate('/operations/transfers/new')}
                                        sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, borderColor: 'grey.300', color: 'text.primary' }}
                                    >
                                        New Transfer
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={() => navigate('/products')}
                                        sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, borderColor: 'grey.300', color: 'text.primary' }}
                                    >
                                        Add Product
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Box>
    );
};

export default Dashboard;
