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
    CircularProgress,
    Alert,
    Fade
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ReceiptList = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const response = await axios.get('/receipts');
            setReceipts(response.data);
        } catch (err) {
            setError('Failed to fetch receipts');
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Fade in={true}>
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Receipts
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/operations/receipts/new')}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                        >
                            New Receipt
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Vendor</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Scheduled Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {receipts.map((receipt) => (
                                    <TableRow
                                        key={receipt.id}
                                        hover
                                        onClick={() => navigate(`/operations/receipts/${receipt.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell sx={{ fontWeight: 500 }}>{receipt.reference}</TableCell>
                                        <TableCell>{receipt.contact_name}</TableCell>
                                        <TableCell>{receipt.location_name}</TableCell>
                                        <TableCell>{receipt.scheduled_date ? new Date(receipt.scheduled_date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={receipt.status.toUpperCase()}
                                                size="small"
                                                color={getStatusColor(receipt.status)}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {receipts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No receipts found</TableCell>
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

export default ReceiptList;
