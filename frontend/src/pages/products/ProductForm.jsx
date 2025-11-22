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
    MenuItem,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Inventory as InventoryIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        price: '',
        cost: ''
    });
    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState([]);
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
                const catResponse = await axios.get('/categories');
                setCategories(catResponse.data);

                if (isEditMode) {
                    const prodResponse = await axios.get(`/products/${id}`);
                    setFormData({
                        name: prodResponse.data.name,
                        sku: prodResponse.data.sku,
                        description: prodResponse.data.description || '',
                        category_id: prodResponse.data.category_id || '',
                        price: prodResponse.data.price,
                        cost: prodResponse.data.cost
                    });

                    const invResponse = await axios.get(`/products/${id}/inventory`);
                    setInventory(invResponse.data);
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

    const handleInventoryChange = (locationId, field, value) => {
        setInventory(inventory.map(item =>
            item.location_id === locationId ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let productId = id;
            if (isEditMode) {
                await axios.put(`/products/${id}`, formData);
            } else {
                const response = await axios.post('/products', formData);
                productId = response.data.id;
            }

            if (inventory.length > 0) {
                await Promise.all(inventory.map(item =>
                    axios.post(`/products/${productId}/inventory`, {
                        location_id: item.location_id,
                        min_quantity: item.min_quantity
                    })
                ));
            }

            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    // Fetch locations for new product to populate inventory table
    useEffect(() => {
        if (!isEditMode && !initialLoading) {
            const fetchLocations = async () => {
                try {
                    const locResponse = await axios.get('/locations');
                    // Initialize inventory state with 0s
                    setInventory(locResponse.data.map(loc => ({
                        location_id: loc.id,
                        location_name: loc.name,
                        quantity: 0,
                        min_quantity: 0
                    })));
                } catch (err) {
                    console.error("Failed to fetch locations for new product", err);
                }
            };
            fetchLocations();
        }
    }, [isEditMode, initialLoading]);


    if (initialLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Fade in={true}>
                <form onSubmit={handleSubmit}>
                    {/* Header Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton onClick={() => navigate('/products')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {isEditMode ? 'Edit Product' : 'New Product'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isEditMode ? `Update details for ${formData.name}` : 'Create a new product in the catalog'}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={loading}
                            sx={{ px: 4, borderRadius: 2 }}
                        >
                            Save Product
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {/* Left Column: Product Details */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                                    Product Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Product Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="SKU"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            select
                                            label="Category"
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            fullWidth
                                        >
                                            {categories.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Right Column: Pricing */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                                <Box display="flex" alignItems="center" gap={2} mb={3}>
                                    <MoneyIcon color="primary" />
                                    <Typography variant="h6" fontWeight="600">
                                        Pricing
                                    </Typography>
                                </Box>
                                <Box display="flex" flexDirection="column" gap={3}>
                                    <TextField
                                        label="Sales Price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        fullWidth
                                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                    />
                                    <TextField
                                        label="Cost Price"
                                        name="cost"
                                        type="number"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        fullWidth
                                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                        helperText="Internal cost for profit calculation"
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Bottom Section: Inventory */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <Box display="flex" alignItems="center" gap={2} mb={3}>
                                    <InventoryIcon color="primary" />
                                    <Typography variant="h6" fontWeight="600">
                                        Inventory & Reordering Rules
                                    </Typography>
                                </Box>
                                <TableContainer variant="outlined" sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                                                <TableCell width="200" sx={{ fontWeight: 600 }}>Current Stock</TableCell>
                                                <TableCell width="200" sx={{ fontWeight: 600 }}>Reorder Point (Min)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {inventory.map((item) => (
                                                <TableRow key={item.location_id}>
                                                    <TableCell>{item.location_name}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.quantity}
                                                            disabled
                                                            fullWidth
                                                            InputProps={{
                                                                inputProps: { min: 0 },
                                                                sx: { bgcolor: 'action.hover' }
                                                            }}
                                                            variant="standard"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.min_quantity}
                                                            onChange={(e) => handleInventoryChange(item.location_id, 'min_quantity', e.target.value)}
                                                            InputProps={{ inputProps: { min: 0 } }}
                                                            fullWidth
                                                            variant="standard"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {inventory.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                        No locations found. Add locations in Settings first.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Fade>
        </Box>
    );
};

export default ProductForm;
