import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, addMonths } from "date-fns";
import { useInvoice } from "../../contexts/InvoiceContext";

const PaymentForm = ({ invoice, onPaymentRecorded }) => {
  const { recordPayment, createPaymentPlan, getPaymentPlanByInvoiceId } =
    useInvoice();

  const [amount, setAmount] = useState(invoice?.totalAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPaymentPlan, setIsPaymentPlan] = useState(false);
  const [installments, setInstallments] = useState([
    {
      dueDate: new Date(),
      amount: invoice?.totalAmount || 0,
      status: "pending",
      paymentDate: null,
      paymentMethod: null,
    },
  ]);
  const [existingPaymentPlan, setExistingPaymentPlan] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    const fetchPaymentPlan = async () => {
      if (invoice && invoice.id) {
        // Check if there's an existing payment plan
        const plan = await getPaymentPlanByInvoiceId(invoice.id);
        if (plan) {
          setExistingPaymentPlan(plan);
          setIsPaymentPlan(true);
        }
      }
    };

    fetchPaymentPlan();
  }, [invoice, getPaymentPlanByInvoiceId]);

  useEffect(() => {
    // Reset amount to invoice total when switching between payment methods
    if (!isPaymentPlan) {
      setAmount(invoice?.totalAmount || 0);
    }
  }, [isPaymentPlan, invoice]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(parseFloat(e.target.value) || 0);
  };

  const handlePaymentPlanToggle = () => {
    setIsPaymentPlan((prev) => !prev);

    // If switching to payment plan, set up initial installment
    if (!isPaymentPlan) {
      setInstallments([
        {
          dueDate: new Date(),
          amount: invoice?.totalAmount || 0,
          status: "pending",
          paymentDate: null,
          paymentMethod: null,
        },
      ]);
    }
  };

  const handleAddInstallment = () => {
    // Split the remaining amount evenly between installments
    const totalAmount = invoice?.totalAmount || 0;
    const currentTotal = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    const remaining = totalAmount - currentTotal;

    // Calculate next month for due date
    const lastInstallment = installments[installments.length - 1];
    const nextDueDate = addMonths(new Date(lastInstallment.dueDate), 1);

    setInstallments([
      ...installments,
      {
        dueDate: nextDueDate,
        amount: remaining,
        status: "pending",
        paymentDate: null,
        paymentMethod: null,
      },
    ]);
  };

  const handleRemoveInstallment = (index) => {
    // Don't allow removing the last installment
    if (installments.length <= 1) return;

    const updatedInstallments = [...installments];
    const removedAmount = updatedInstallments[index].amount;

    // Remove the installment
    updatedInstallments.splice(index, 1);

    // Add the removed amount to the first installment
    updatedInstallments[0].amount += removedAmount;

    setInstallments(updatedInstallments);
  };

  const handleInstallmentDateChange = (index, date) => {
    const updatedInstallments = [...installments];
    updatedInstallments[index].dueDate = date;
    setInstallments(updatedInstallments);
  };

  const handleInstallmentAmountChange = (index, value) => {
    const updatedInstallments = [...installments];

    // Calculate old amount and new amount difference
    const oldAmount = updatedInstallments[index].amount;
    const newAmount = parseFloat(value) || 0;
    const difference = oldAmount - newAmount;

    // Update the amount for this installment
    updatedInstallments[index].amount = newAmount;

    // If there's a difference, adjust the first installment
    if (difference !== 0 && index !== 0) {
      updatedInstallments[0].amount += difference;

      // Make sure first installment doesn't go negative
      if (updatedInstallments[0].amount < 0) {
        updatedInstallments[0].amount = 0;
      }
    }

    setInstallments(updatedInstallments);
  };

  const handleRecordPayment = async () => {
    try {
      if (!isPaymentPlan) {
        // Regular payment
        await recordPayment(invoice.id, amount, paymentMethod);

        if (onPaymentRecorded) {
          onPaymentRecorded();
        }
      } else {
        // Payment plan
        // Validate installments add up to total amount
        const totalInstallmentsAmount = installments.reduce(
          (sum, inst) => sum + (parseFloat(inst.amount) || 0),
          0
        );

        if (Math.abs(totalInstallmentsAmount - invoice.totalAmount) > 0.01) {
          alert(
            `Total installments (${totalInstallmentsAmount}) must equal invoice total (${invoice.totalAmount})`
          );
          return;
        }

        await createPaymentPlan(
          invoice.id,
          invoice.patientId,
          invoice.totalAmount,
          installments,
          paymentNotes
        );

        if (onPaymentRecorded) {
          onPaymentRecorded();
        }
      }

      alert("Payment recorded successfully");
    } catch (error) {
      console.error("Failed to record payment:", error);
      alert("Failed to record payment");
    }
  };

  const renderRegularPaymentForm = () => {
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    $
                  </Typography>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Credit/Debit Card</MenuItem>
                <MenuItem value="online">Online Transfer</MenuItem>
                <MenuItem value="check">Check</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>
                {amount < invoice?.totalAmount
                  ? `Partial payment (Remaining: $${(
                      invoice?.totalAmount - amount
                    ).toFixed(2)})`
                  : "Full payment"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPaymentPlanForm = () => {
    const totalPlannedAmount = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    const remainingAmount = (invoice?.totalAmount || 0) - totalPlannedAmount;

    return (
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1">Payment Plan Installments</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={handleAddInstallment}
          >
            Add Installment
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {installments.map((installment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <DatePicker
                      value={new Date(installment.dueDate)}
                      onChange={(date) =>
                        handleInstallmentDateChange(index, date)
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" fullWidth />
                      )}
                      minDate={new Date()}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="number"
                      value={installment.amount}
                      onChange={(e) =>
                        handleInstallmentAmountChange(index, e.target.value)
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
                      onClick={() => handleRemoveInstallment(index)}
                      disabled={installments.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Total Planned
                  </Typography>
                </TableCell>
                <TableCell colSpan={2}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color={
                      Math.abs(totalPlannedAmount - invoice?.totalAmount) < 0.01
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    ${totalPlannedAmount.toFixed(2)} / $
                    {invoice?.totalAmount?.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Add notes about the payment plan..."
          />
        </Box>
      </Box>
    );
  };

  const renderExistingPaymentPlan = () => {
    if (!existingPaymentPlan) return null;

    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Existing Payment Plan
        </Typography>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Total Amount: ${existingPaymentPlan.totalAmount.toFixed(2)}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created on{" "}
              {format(new Date(existingPaymentPlan.createdAt), "MMMM d, yyyy")}
            </Typography>

            {existingPaymentPlan.notes && (
              <Typography variant="body2" sx={{ my: 1 }}>
                Notes: {existingPaymentPlan.notes}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Installments
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {existingPaymentPlan.installments.map(
                    (installment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {format(new Date(installment.dueDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>${installment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={installment.status.toUpperCase()}
                            size="small"
                            color={
                              installment.status === "paid"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  if (!invoice) {
    return <Typography>No invoice selected</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Record Payment for Invoice #{invoice.id}
      </Typography>

      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h6">
              ${invoice.totalAmount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Current Status
            </Typography>
            <Typography
              variant="h6"
              color={
                invoice.paymentStatus === "paid"
                  ? "success.main"
                  : invoice.paymentStatus === "partial"
                  ? "warning.main"
                  : "error.main"
              }
            >
              {invoice.paymentStatus.toUpperCase()}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box mb={3}>
        {existingPaymentPlan ? (
          renderExistingPaymentPlan()
        ) : (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={isPaymentPlan}
                  onChange={handlePaymentPlanToggle}
                  color="primary"
                />
              }
              label="Create Payment Plan"
            />

            <Divider sx={{ my: 2 }} />

            {isPaymentPlan
              ? renderPaymentPlanForm()
              : renderRegularPaymentForm()}
          </>
        )}
      </Box>

      <Box display="flex" justifyContent="flex-end">
        {!existingPaymentPlan && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleRecordPayment}
            disabled={invoice.paymentStatus === "paid"}
          >
            {isPaymentPlan ? "Create Payment Plan" : "Record Payment"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PaymentForm;
