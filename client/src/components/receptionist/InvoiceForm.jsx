import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";
import { useInvoice } from "../../contexts/InvoiceContext";
import { useAppointment } from "../../contexts/AppointmentContext";
import { usePatient } from "../../contexts/PatientContext";

const InvoiceForm = ({ appointmentId, onInvoiceCreated }) => {
  const { generateInvoice, getInvoiceByAppointmentId } = useInvoice();
  const { getAppointmentById } = useAppointment();
  const { getPatientById } = usePatient();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([
    { description: "Consultation Fee", amount: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (appointmentId) {
        // Check if invoice already exists
        const invoice = await getInvoiceByAppointmentId(appointmentId);
        if (invoice) {
          setExistingInvoice(invoice);
        }

        // Fetch appointment and patient data
        const appointmentData = await getAppointmentById(appointmentId);
        if (appointmentData) {
          setAppointment(appointmentData);

          // Set initial consultation fee from appointment
          if (appointmentData.fees) {
            setInvoiceItems([
              { description: "Consultation Fee", amount: appointmentData.fees },
            ]);
            setTotalAmount(appointmentData.fees);
          }

          // Fetch patient data
          const patientData = await getPatientById(appointmentData.patientId);
          if (patientData) {
            setPatient(patientData);
          }
        }
      }
    };

    fetchData();
  }, [
    appointmentId,
    getInvoiceByAppointmentId,
    getAppointmentById,
    getPatientById,
  ]);

  // Calculate total amount whenever invoice items change
  useEffect(() => {
    const newTotal = invoiceItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
    setTotalAmount(newTotal);
  }, [invoiceItems]);

  const handleItemDescriptionChange = (index, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index].description = value;
    setInvoiceItems(updatedItems);
  };

  const handleItemAmountChange = (index, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index].amount = parseFloat(value) || 0;
    setInvoiceItems(updatedItems);
  };

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { description: "", amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  const handleGenerateInvoice = async () => {
    if (!appointment || !patient) {
      alert("Appointment or patient information is missing");
      return;
    }

    // Check if all items have descriptions
    if (invoiceItems.some((item) => !item.description)) {
      alert("All invoice items must have a description");
      return;
    }

    try {
      const newInvoice = await generateInvoice(
        appointment.id,
        patient.id,
        invoiceItems,
        totalAmount
      );

      if (onInvoiceCreated) {
        onInvoiceCreated(newInvoice);
      }

      // Set existing invoice to show the view
      setExistingInvoice(newInvoice);

      // Open payment dialog
      setIsPaymentDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to generate invoice");
    }
  };

  const renderInvoiceForm = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Create New Invoice
        </Typography>

        {appointment && patient && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Patient
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {patient.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(), "MMMM d, yyyy")}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Appointment
              </Typography>
              <Typography variant="body1">
                {appointment.date} ({appointment.startTime} -{" "}
                {appointment.endTime})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Doctor
              </Typography>
              <Typography variant="body1">
                {appointment.doctorName || "Unknown Doctor"}
              </Typography>
            </Grid>
          </Grid>
        )}

        <Box mb={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="subtitle1">Invoice Items</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="60%">Description</TableCell>
                  <TableCell width="30%">Amount</TableCell>
                  <TableCell width="10%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={item.description}
                        onChange={(e) =>
                          handleItemDescriptionChange(index, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemAmountChange(index, e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              $
                            </Typography>
                          ),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        disabled={invoiceItems.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={1} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      ${totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateInvoice}
          >
            Generate Invoice
          </Button>
        </Box>
      </Box>
    );
  };

  const renderExistingInvoice = () => {
    if (!existingInvoice) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Invoice #{existingInvoice.id}
        </Typography>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient?.name || "Unknown Patient"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(existingInvoice.date), "MMMM d, yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  color={
                    existingInvoice.paymentStatus === "paid"
                      ? "success.main"
                      : existingInvoice.paymentStatus === "partial"
                      ? "warning.main"
                      : "error.main"
                  }
                >
                  {existingInvoice.paymentStatus.toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {existingInvoice.paymentMethod || "Not Paid"}
                </Typography>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Invoice Items
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {existingInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">
                          ${item.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          Total
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          ${existingInvoice.totalAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsPaymentDialogOpen(true)}
            disabled={existingInvoice.paymentStatus === "paid"}
          >
            Record Payment
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      {existingInvoice ? renderExistingInvoice() : renderInvoiceForm()}

      {/* Payment Dialog component would be implemented separately */}
      <Dialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Total Amount: ${existingInvoice?.totalAmount.toFixed(2) || 0}
          </Typography>

          {/* This would be replaced with a full PaymentForm component */}
          <Typography variant="body2" color="text.secondary">
            Payment processing functionality would be implemented in a separate
            PaymentForm component.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentDialogOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InvoiceForm;
