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
    Button,
    Chip,
    CircularProgress,
    Alert,
    Fade,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid
} from '@mui/material';
import { Edit as EditIcon, Inventory as InventoryIcon } from '@mui/icons-material';

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustments, setAdjustments] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        try {
            const response = await axios.get('/products');
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch stock data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async (product) => {
        setSelectedProduct(product);
        setModalLoading(true);
        setOpenModal(true);
        try {
            // Fetch current inventory for this product to populate the modal
            const response = await axios.get(`/products/${product.id}/inventory`);
            // We need to ensure we have an entry for every location, even if quantity is 0
            // The API already does this by joining with locations table
            setAdjustments(response.data.map(item => ({
                location_id: item.location_id,
                location_name: item.location_name,
                quantity: item.quantity
            })));
        } catch (err) {
            console.error("Failed to fetch product inventory", err);
            setError("Failed to load inventory details");
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedProduct(null);
        setAdjustments([]);
    };

    const handleQuantityChange = (locationId, newQuantity) => {
        setAdjustments(adjustments.map(adj =>
            adj.location_id === locationId ? { ...adj, quantity: parseInt(newQuantity) || 0 } : adj
        ));
    };

    const handleSaveStock = async () => {
        setModalLoading(true);
        try {
            await axios.post(`/products/${selectedProduct.id}/adjust-stock`, adjustments.map(adj => ({
                location_id: adj.location_id,
                quantity: adj.quantity
            })));

            // Refresh main table
            await fetchStockData();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to update stock", err);
            // Ideally show error in modal, but for simplicity using main error or alert
            alert("Failed to update stock");
        } finally {
            setModalLoading(false);
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
                    <Box display="flex" alignItems="center" gap={2} mb={4}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.main' }}>
                            <InventoryIcon />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Stock Management
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Product Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>SKU</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Unit Price</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>On Hand</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Free to Use</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                                        <TableCell>
                                            <Chip label={product.sku} size="small" sx={{ bgcolor: 'grey.100', fontWeight: 600 }} />
                                        </TableCell>
                                        <TableCell align="right">${parseFloat(product.price).toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={product.total_stock}
                                                size="small"
                                                color={product.total_stock > 0 ? 'success' : 'error'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {/* Currently Free to Use is same as On Hand as we don't have reservations yet */}
                                            <Chip
                                                label={product.total_stock}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenModal(product)}
                                            >
                                                Update Stock
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No products found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Fade>

            {/* Stock Adjustment Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    Update Stock: {selectedProduct?.name}
                    <Typography variant="caption" display="block" color="text.secondary">
                        SKU: {selectedProduct?.sku}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {modalLoading ? (
                        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                    ) : (
                        <Grid container spacing={2}>
                            {adjustments.map((adj) => (
                                <Grid item xs={12} sm={6} key={adj.location_id}>
                                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2">{adj.location_name}</Typography>
                                        <TextField
                                            type="number"
                                            label="Quantity"
                                            size="small"
                                            value={adj.quantity}
                                            onChange={(e) => handleQuantityChange(adj.location_id, e.target.value)}
                                            InputProps={{ inputProps: { min: 0 } }}
                                            sx={{ width: 120 }}
                                        />
                                    </Paper>
                                </Grid>
                            ))}
                            {adjustments.length === 0 && (
                                <Grid item xs={12}>
                                    <Typography align="center" color="text.secondary">No locations found.</Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button
                        onClick={handleSaveStock}
                        variant="contained"
                        disabled={modalLoading}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Stock;
