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
    TableRow
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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

            // Save inventory updates if in edit mode (or if we just created it, though inventory would be empty initially unless we pre-fetched locations, but for now we only show inventory in edit mode or if we fetch locations for new products too. Let's keep it simple: inventory editing is available after creation or we can fetch locations for new products too. Let's fetch locations for new products too to allow setting initial stock.)

            // Wait, my fetch logic only fetches inventory if isEditMode. Let's fix that.
            // Actually, for a new product, we can't set inventory until the product exists. 
            // So the flow is: Create Product -> Then Edit to set Inventory OR we handle it in one go.
            // To keep it simple and robust: 
            // 1. Create Product
            // 2. If successful, iterate inventory state and save each.

            // But wait, if it's a new product, `inventory` state is empty because I only fetch it in `isEditMode`.
            // I should fetch locations for new products too so the user can see the table.

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
        <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            <Fade in={true}>
                <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" alignItems="center" mb={4}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/products')}
                            sx={{ mr: 2, color: 'text.secondary' }}
                        >
                            Back
                        </Button>
                        <Typography variant="h5" fontWeight="bold">
                            {isEditMode ? 'Edit Product' : 'Add New Product'}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Box display="flex" flexDirection="column" gap={3}>
                                    <TextField
                                        label="Product Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="SKU"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleChange}
                                                required
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
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
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Price"
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleChange}
                                                fullWidth
                                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Cost"
                                                name="cost"
                                                type="number"
                                                value={formData.cost}
                                                onChange={handleChange}
                                                fullWidth
                                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>Inventory & Reordering Rules</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell>Location</TableCell>
                                                <TableCell width="200">Current Stock</TableCell>
                                                <TableCell width="200">Reorder Point (Min)</TableCell>
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
                                                            InputProps={{
                                                                inputProps: { min: 0 },
                                                                sx: { bgcolor: 'action.hover' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.min_quantity}
                                                            onChange={(e) => handleInventoryChange(item.location_id, 'min_quantity', e.target.value)}
                                                            InputProps={{ inputProps: { min: 0 } }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {inventory.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">No locations found. Add locations in Settings first.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" mt={4}>
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
                                {isEditMode ? 'Update Product' : 'Create Product'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
};

export default ProductForm;
