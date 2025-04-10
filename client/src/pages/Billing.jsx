import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import SearchIcon from "@mui/icons-material/Search";

import InvoiceForm from "../components/receptionist/InvoiceForm";
import PaymentForm from "../components/receptionist/PaymentForm";
import { useInvoice } from "../contexts/InvoiceContext";
import { useAppointment } from "../contexts/AppointmentContext";
import { useAuth } from "../contexts/AuthContext";

const Billing = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [searchAppointmentId, setSearchAppointmentId] = useState("");
  const [searchInvoiceId, setSearchInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const { user } = useAuth();
  const { getAppointmentById } = useAppointment();
  const { getInvoiceByAppointmentId, invoices, getInvoiceByInvoiceId } =
    useInvoice();

  const isReceptionist = user && user.role === "receptionist";

  useEffect(() => {
    if (selectedAppointmentId) {
      handleAppointmentSelected(selectedAppointmentId);
    }
  }, [selectedAppointmentId]);

  useEffect(() => {
    if (selectedInvoiceId) {
      handleInvoiceSelected(selectedInvoiceId);
    }
  }, [selectedInvoiceId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset selections when changing tabs
    setSelectedAppointmentId(null);
    setSelectedInvoiceId(null);
    setSelectedInvoice(null);
  };

  const handleAppointmentSearch = () => {
    if (searchAppointmentId) {
      setSelectedAppointmentId(searchAppointmentId);
      setIsAppointmentDialogOpen(false);
    }
  };

  const handleInvoiceSearch = () => {
    if (searchInvoiceId) {
      setSelectedInvoiceId(searchInvoiceId);
      setIsInvoiceDialogOpen(false);
    }
  };

  const handleAppointmentSelected = async (appointmentId) => {
    try {
      // Check if the appointment exists
      const appointment = await getAppointmentById(appointmentId);

      if (!appointment) {
        alert("Appointment not found");
        return;
      }

      // Check if an invoice already exists for this appointment
      const existingInvoice = await getInvoiceByAppointmentId(appointmentId);

      if (existingInvoice) {
        // If invoice exists, set it for payment form
        setSelectedInvoice(existingInvoice);
        setActiveTab(1); // Switch to payment tab
      }

      setSelectedAppointmentId(appointmentId);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      alert("Error loading appointment");
    }
  };

  const handleInvoiceSelected = async (invoiceId) => {
    try {
      // Fetch the invoice
      const invoice = await getInvoiceByInvoiceId(invoiceId);

      if (!invoice) {
        alert("Invoice not found");
        return;
      }

      setSelectedInvoice(invoice);
      setSelectedInvoiceId(invoiceId);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Error loading invoice");
    }
  };

  const handleInvoiceCreated = (invoice) => {
    // When an invoice is created, set it for payment
    setSelectedInvoice(invoice);

    // Switch to payment tab
    setActiveTab(1);
  };

  const handlePaymentRecorded = () => {
    // Refresh the invoice after payment
    handleInvoiceSelected(selectedInvoice.id);
  };

  if (!isReceptionist) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Only receptionists can access the billing page.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" mb={2}>
          Billing Management
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            aria-label="billing tabs"
          >
            <Tab icon={<ReceiptIcon />} label="Generate Invoice" />
            <Tab icon={<PaymentIcon />} label="Record Payment" />
          </Tabs>

          <Box>
            {activeTab === 0 ? (
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => setIsAppointmentDialogOpen(true)}
              >
                Find Appointment
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => setIsInvoiceDialogOpen(true)}
              >
                Find Invoice
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {activeTab === 0 ? (
        <InvoiceForm
          appointmentId={selectedAppointmentId}
          onInvoiceCreated={handleInvoiceCreated}
        />
      ) : (
        <PaymentForm
          invoice={selectedInvoice}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {/* Find Appointment Dialog */}
      <Dialog
        open={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
      >
        <DialogTitle>Find Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Appointment ID"
              variant="outlined"
              value={searchAppointmentId}
              onChange={(e) => setSearchAppointmentId(e.target.value)}
              placeholder="Enter appointment ID"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Enter the ID of the appointment you want to generate an invoice
              for. Note: For a real app, this would have a more user-friendly
              appointment search.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAppointmentDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAppointmentSearch} variant="contained">
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Find Invoice Dialog */}
      <Dialog
        open={isInvoiceDialogOpen}
        onClose={() => setIsInvoiceDialogOpen(false)}
      >
        <DialogTitle>Find Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Invoice ID"
              variant="outlined"
              value={searchInvoiceId}
              onChange={(e) => setSearchInvoiceId(e.target.value)}
              placeholder="Enter invoice ID"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Enter the ID of the invoice you want to process payment for. Note:
              For a real app, this would have a more user-friendly invoice
              search.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInvoiceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInvoiceSearch} variant="contained">
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Billing;
