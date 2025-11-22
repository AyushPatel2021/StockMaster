import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Fade,
    TextField,
    InputAdornment,
    Tabs,
    Tab
} from '@mui/material';
import {
    Search as SearchIcon,
    History as HistoryIcon,
    CallReceived as ReceiptIcon,
    LocalShipping as DeliveryIcon,
    SwapHoriz as TransferIcon
} from '@mui/icons-material';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/history');
            setHistory(response.data);
        } catch (err) {
            setError('Failed to fetch history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'default';
            case 'ready': return 'primary';
            case 'done': return 'success';
            default: return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'receipt': return <ReceiptIcon color="success" />;
            case 'delivery': return <DeliveryIcon color="primary" />;
            case 'transfer': return <TransferIcon color="warning" />;
            default: return <HistoryIcon />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'receipt': return 'Receipt';
            case 'delivery': return 'Delivery';
            case 'transfer': return 'Transfer';
            default: return type;
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.partner_name && item.partner_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Fade in={true}>
                <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={4}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.100', color: 'grey.700' }}>
                            <HistoryIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">
                                Operation History
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                View all stock movements and operations
                            </Typography>
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Paper sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Tabs
                            value={filterType}
                            onChange={(e, val) => setFilterType(val)}
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                        >
                            <Tab label="All" value="all" />
                            <Tab label="Receipts" value="receipt" icon={<ReceiptIcon fontSize="small" />} iconPosition="start" />
                            <Tab label="Deliveries" value="delivery" icon={<DeliveryIcon fontSize="small" />} iconPosition="start" />
                            <Tab label="Transfers" value="transfer" icon={<TransferIcon fontSize="small" />} iconPosition="start" />
                        </Tabs>
                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Search by reference or partner..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Box>
                    </Paper>

                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Partner / Location</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.map((item) => (
                                    <TableRow key={`${item.type}-${item.id}`} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getTypeIcon(item.type)}
                                                <Typography variant="body2">{getTypeLabel(item.type)}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{item.reference}</TableCell>
                                        <TableCell>{item.partner_name}</TableCell>
                                        <TableCell>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status.toUpperCase()}
                                                color={getStatusColor(item.status)}
                                                size="small"
                                                sx={{ fontWeight: 'bold', minWidth: 80 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No history found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Fade>
        </Box>
    );
};

export default History;
