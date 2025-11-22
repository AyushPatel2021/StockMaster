import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Fade
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';

const LocationList = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await axios.get('/locations');
            setLocations(response.data);
        } catch (err) {
            setError('Failed to fetch locations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await axios.delete(`/locations/${id}`);
                setLocations(locations.filter(l => l.id !== id));
            } catch (err) {
                setError('Failed to delete location');
                console.error(err);
            }
        }
    };

    const canEdit = user.role === 'Admin' || user.role === 'InventoryManager';

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
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.main' }}>
                                <LocationIcon />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">
                                Locations
                            </Typography>
                        </Box>
                        {canEdit && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/settings/location/new')}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                Add Location
                            </Button>
                        )}
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Short Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Warehouse</TableCell>
                                    {canEdit && <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {locations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No locations found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    locations.map((location) => (
                                        <TableRow key={location.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 500 }}>{location.name}</TableCell>
                                            <TableCell>
                                                <Chip label={location.short_code} size="small" sx={{ bgcolor: 'secondary.50', color: 'secondary.main', fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body2" color="text.primary">{location.warehouse_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">({location.warehouse_code})</Typography>
                                                </Box>
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/settings/location/edit/${location.id}`)}
                                                        sx={{ color: 'primary.main', mr: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(location.id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Fade>
        </Box>
    );
};

export default LocationList;
