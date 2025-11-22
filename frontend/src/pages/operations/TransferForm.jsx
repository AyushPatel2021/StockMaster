import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Autocomplete,
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
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    stepConnectorClasses,
    styled
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckIcon,
    SwapHoriz as TransferIcon,
    AssignmentTurnedIn as DoneIcon
} from '@mui/icons-material';

// Custom Stepper Styles
const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.warning.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.success.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const TransferForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        source_location_id: null,
        dest_location_id: null,
        scheduled_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        reference: 'New'
    });
    const [lines, setLines] = useState([]);

    // Options
    const [locations, setLocations] = useState([]);
    const [products, setProducts] = useState([]);

    const steps = ['Draft', 'Ready', 'Done'];
    const activeStep = steps.indexOf(formData.status.charAt(0).toUpperCase() + formData.status.slice(1));

    useEffect(() => {
        fetchOptions();
        if (isEdit) {
            fetchTransfer();
        }
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [locationsRes, productsRes] = await Promise.all([
                axios.get('/locations'),
                axios.get('/products')
            ]);
            setLocations(locationsRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            console.error("Failed to fetch options", err);
        }
    };

    const fetchTransfer = async () => {
        try {
            const response = await axios.get(`/transfers/${id}`);
            const data = response.data;
            setFormData({
                source_location_id: data.source_location_id,
                dest_location_id: data.dest_location_id,
                scheduled_date: data.scheduled_date ? data.scheduled_date.split('T')[0] : '',
                status: data.status,
                reference: data.reference
            });
            setLines(data.lines.map(line => ({
                product_id: line.product_id,
                quantity: line.quantity,
                product: { id: line.product_id, name: line.product_name, sku: line.product_sku }
            })));
        } catch (err) {
            setError('Failed to fetch transfer details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLine = () => {
        setLines([...lines, { product_id: null, quantity: 1, product: null }]);
    };

    const handleRemoveLine = (index) => {
        const newLines = [...lines];
        newLines.splice(index, 1);
        setLines(newLines);
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...lines];
        if (field === 'product') {
            newLines[index].product = value;
            newLines[index].product_id = value ? value.id : null;
        } else {
            newLines[index][field] = value;
        }
        setLines(newLines);
    };

    const handleSubmit = async () => {
        if (!formData.source_location_id || !formData.dest_location_id || lines.length === 0) {
            setError('Please fill in all required fields and add at least one product.');
            return;
        }

        if (formData.source_location_id === formData.dest_location_id) {
            setError('Source and Destination locations cannot be the same.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                lines: lines.map(l => ({ product_id: l.product_id, quantity: parseInt(l.quantity) }))
            };

            const response = await axios.post('/transfers', payload);
            navigate(`/operations/transfers/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create transfer');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!isEdit) return;
        setSaving(true);
        setError(''); // Clear previous errors
        try {
            if (newStatus === 'ready') {
                // Check Availability
                await axios.put(`/transfers/${id}/check-availability`);
            } else if (newStatus === 'done') {
                // Validate
                await axios.put(`/transfers/${id}/validate`);
            }
            fetchTransfer(); // Refresh data
        } catch (err) {
            setError(err.response?.data?.error || `Failed to update status`);
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    const isReadOnly = formData.status !== 'draft';

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Fade in={true}>
                <Box>
                    {/* Header Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton onClick={() => navigate('/operations/transfers')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {isEdit ? formData.reference : 'New Transfer'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isEdit ? `Created on ${new Date().toLocaleDateString()}` : 'Move stock between locations'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2}>
                            {formData.status === 'draft' && isEdit && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleStatusChange('ready')}
                                    disabled={saving}
                                    startIcon={<CheckIcon />}
                                    sx={{ px: 4, borderRadius: 2 }}
                                >
                                    Check Availability
                                </Button>
                            )}
                            {formData.status === 'ready' && isEdit && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleStatusChange('done')}
                                    disabled={saving}
                                    startIcon={<DoneIcon />}
                                    sx={{ px: 4, borderRadius: 2 }}
                                >
                                    Validate
                                </Button>
                            )}
                            {!isEdit && (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    sx={{ px: 4, borderRadius: 2 }}
                                >
                                    Save
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Status Stepper */}
                    {isEdit && (
                        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Paper>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {/* Main Form */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                                    Transfer Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={locations}
                                            getOptionLabel={(option) => option.name}
                                            value={locations.find(l => l.id === formData.source_location_id) || null}
                                            onChange={(e, val) => setFormData({ ...formData, source_location_id: val ? val.id : null })}
                                            disabled={isReadOnly}
                                            renderInput={(params) => <TextField {...params} label="Source Location" required fullWidth />}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={locations}
                                            getOptionLabel={(option) => option.name}
                                            value={locations.find(l => l.id === formData.dest_location_id) || null}
                                            onChange={(e, val) => setFormData({ ...formData, dest_location_id: val ? val.id : null })}
                                            disabled={isReadOnly}
                                            renderInput={(params) => <TextField {...params} label="Destination Location" required fullWidth />}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            type="date"
                                            label="Scheduled Date"
                                            value={formData.scheduled_date}
                                            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            disabled={isReadOnly}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Status Card */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', bgcolor: 'warning.main', color: 'white' }}>
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <TransferIcon fontSize="large" />
                                    <Typography variant="h6" fontWeight="bold">Status Overview</Typography>
                                </Box>
                                <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                                    Current status is <strong>{formData.status.toUpperCase()}</strong>.
                                </Typography>
                                {formData.status === 'draft' && (
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Draft transfers are editable. Click "Check Availability" to reserve stock at the source location.
                                    </Typography>
                                )}
                                {formData.status === 'ready' && (
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Stock is reserved at Source (Free to Use decreased). Validate to move stock to Destination.
                                    </Typography>
                                )}
                                {formData.status === 'done' && (
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Transfer is validated. Stock has been moved from Source to Destination.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                        {/* Product Lines */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                                    Products
                                </Typography>
                                <TableContainer variant="outlined" sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell width="60%" sx={{ fontWeight: 600 }}>Product</TableCell>
                                                <TableCell width="20%" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                                {!isReadOnly && <TableCell width="10%" sx={{ fontWeight: 600 }}>Action</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lines.map((line, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Autocomplete
                                                            options={products}
                                                            getOptionLabel={(option) => `${option.name} [${option.sku}]`}
                                                            value={line.product}
                                                            onChange={(e, val) => handleLineChange(index, 'product', val)}
                                                            disabled={isReadOnly}
                                                            renderInput={(params) => <TextField {...params} placeholder="Select Product" size="small" variant="standard" />}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            value={line.quantity}
                                                            onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                                                            size="small"
                                                            InputProps={{ inputProps: { min: 1 } }}
                                                            disabled={isReadOnly}
                                                            fullWidth
                                                            variant="standard"
                                                        />
                                                    </TableCell>
                                                    {!isReadOnly && (
                                                        <TableCell>
                                                            <IconButton color="error" onClick={() => handleRemoveLine(index)} size="small">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                            {!isReadOnly && (
                                                <TableRow>
                                                    <TableCell colSpan={3}>
                                                        <Button startIcon={<AddIcon />} onClick={handleAddLine} sx={{ textTransform: 'none' }}>
                                                            Add Product
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Box>
    );
};

export default TransferForm;
