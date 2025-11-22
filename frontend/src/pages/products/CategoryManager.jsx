import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';

const CategoryManager = ({ open, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/categories');
            setCategories(response.data);
        } catch (err) {
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await axios.put(`/categories/${editingCategory.id}`, formData);
            } else {
                await axios.post('/categories', formData);
            }
            setFormData({ name: '', description: '' });
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This might affect products linked to this category.')) {
            try {
                await axios.delete(`/categories/${id}`);
                fetchCategories();
            } catch (err) {
                setError('Failed to delete category');
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        size="small"
                    />
                    <Box display="flex" gap={1} justifyContent="flex-end">
                        {editingCategory && (
                            <Button onClick={handleCancelEdit} color="inherit" size="small">
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" variant="contained" size="small" startIcon={editingCategory ? <EditIcon /> : <AddIcon />}>
                            {editingCategory ? 'Update' : 'Add'}
                        </Button>
                    </Box>
                </Box>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Existing Categories
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
                ) : (
                    <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #eee' }}>
                        {categories.map((category) => (
                            <ListItem key={category.id} divider>
                                <ListItemText
                                    primary={category.name}
                                    secondary={category.description}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleEdit(category)} sx={{ mr: 1, color: 'primary.main' }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDelete(category.id)} sx={{ color: 'error.main' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {categories.length === 0 && (
                            <ListItem>
                                <ListItemText primary="No categories found" sx={{ color: 'text.secondary', textAlign: 'center' }} />
                            </ListItem>
                        )}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryManager;
