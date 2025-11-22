import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Fade
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const WarehouseForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        short_code: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchWarehouse();
        }
    }, [id]);

    const fetchWarehouse = async () => {
        setInitialLoading(true);
        try {
            const response = await axios.get('/warehouses');
            const warehouse = response.data.find(w => w.id === parseInt(id));
            if (warehouse) {
                setFormData({
                    name: warehouse.name,
                    short_code: warehouse.short_code,
                    address: warehouse.address || ''
                });
            } else {
                setError('Warehouse not found');
            }
        } catch (err) {
            setError('Failed to fetch warehouse details');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                await axios.put(`/warehouses/${id}`, formData);
            } else {
                await axios.post('/warehouses', formData);
            }
            navigate('/settings/warehouse');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save warehouse');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Fade in={true}>
                <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" alignItems="center" mb={4}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/settings/warehouse')}
                            sx={{ mr: 2, color: 'text.secondary' }}
                        >
                            Back
                        </Button>
                        <Typography variant="h5" fontWeight="bold">
                            {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <TextField
                                label="Warehouse Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Short Code"
                                name="short_code"
                                value={formData.short_code}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                                helperText="Unique identifier for the warehouse (e.g., WH01)"
                            />
                            <TextField
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                            />
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={loading}
                                    sx={{
                                        borderRadius: 2,
                                        px: 4,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
};

export default WarehouseForm;
