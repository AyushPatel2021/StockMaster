import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
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
    Button,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Fade,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    LocalShipping as ShippingIcon
} from '@mui/icons-material';

const DeliveryList = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const response = await axios.get('/deliveries');
            setDeliveries(response.data);
        } catch (err) {
            setError('Failed to fetch deliveries');
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

    const filteredDeliveries = deliveries.filter(delivery =>
        delivery.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Fade in={true}>
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                                <ShippingIcon />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                    Delivery Orders
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Manage outgoing shipments to customers
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/operations/deliveries/new')}
                            sx={{ borderRadius: 2, px: 3, py: 1 }}
                        >
                            New Delivery
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <TextField
                            fullWidth
                            placeholder="Search deliveries by reference or customer..."
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
                    </Paper>

                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Source Location</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Scheduled Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDeliveries.map((delivery) => (
                                    <TableRow key={delivery.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{delivery.reference}</TableCell>
                                        <TableCell>{delivery.contact_name}</TableCell>
                                        <TableCell>{delivery.location_name}</TableCell>
                                        <TableCell>
                                            {delivery.scheduled_date ? new Date(delivery.scheduled_date).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={delivery.status.toUpperCase()}
                                                color={getStatusColor(delivery.status)}
                                                size="small"
                                                sx={{ fontWeight: 'bold', minWidth: 80 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/operations/deliveries/${delivery.id}`)}
                                                color="primary"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredDeliveries.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No deliveries found
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

export default DeliveryList;
