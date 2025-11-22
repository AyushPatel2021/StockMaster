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
    Fade,
    MenuItem
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const LocationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        short_code: '',
        warehouse_id: ''
    });
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        const fetchData = async () => {
            setInitialLoading(true);
            try {
                const whResponse = await axios.get('/warehouses');
                setWarehouses(whResponse.data);

                if (isEditMode) {
                    const locResponse = await axios.get('/locations');
                    const location = locResponse.data.find(l => l.id === parseInt(id));
                    if (location) {
                        setFormData({
                            name: location.name,
                            short_code: location.short_code,
                            warehouse_id: location.warehouse_id
                        });
                    } else {
                        setError('Location not found');
                    }
                }
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

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
                await axios.put(`/locations/${id}`, formData);
            } else {
                await axios.post('/locations', formData);
            }
            navigate('/settings/location');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save location');
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
                            onClick={() => navigate('/settings/location')}
                            sx={{ mr: 2, color: 'text.secondary' }}
                        >
                            Back
                        </Button>
                        <Typography variant="h5" fontWeight="bold">
                            {isEditMode ? 'Edit Location' : 'Add New Location'}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <TextField
                                select
                                label="Warehouse"
                                name="warehouse_id"
                                value={formData.warehouse_id}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                                helperText="Select the warehouse this location belongs to"
                            >
                                {warehouses.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.name} ({option.short_code})
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Location Name"
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
                                helperText="Unique identifier for the location (e.g., A-01-01)"
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
                                    {isEditMode ? 'Update Location' : 'Create Location'}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
};

export default LocationForm;
