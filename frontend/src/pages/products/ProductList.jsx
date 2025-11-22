import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Fade,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Category as CategoryIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import CategoryManager from './CategoryManager';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [isCategoryManagerOpen]); // Refresh when category manager closes

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/products');
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (err) {
                setError('Failed to delete product');
            }
        }
    };

    const canEdit = user.role === 'Admin';

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
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                                <InventoryIcon />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">
                                Products
                            </Typography>
                        </Box>
                        {canEdit && (
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CategoryIcon />}
                                    onClick={() => setIsCategoryManagerOpen(true)}
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                >
                                    Manage Categories
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/products/new')}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        px: 3,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Add Product
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>SKU</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Category</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Price</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Total Stock</TableCell>
                                    {canEdit && <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No products found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                                            <TableCell>
                                                <Chip label={product.sku} size="small" sx={{ bgcolor: 'grey.100', fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell>
                                                {product.category_name ? (
                                                    <Chip label={product.category_name} size="small" color="primary" variant="outlined" />
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">Uncategorized</Typography>
                                                )}
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
                                            {canEdit && (
                                                <TableCell align="right">
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/products/edit/${product.id}`)}
                                                            sx={{ color: 'primary.main', mr: 1 }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(product.id)}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
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

            <CategoryManager
                open={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
            />
        </Box>
    );
};

export default ProductList;
