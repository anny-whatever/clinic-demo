import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAnalytics } from "../../contexts/AnalyticsContext";
import { useInvoice } from "../../contexts/InvoiceContext";

const FinancialSummary = () => {
  const { getFinancialSummaryByPeriod } = useAnalytics();
  const {
    getTotalRevenue,
    getTotalPendingAmount,
    getOverduePayments,
    invoices,
  } = useInvoice();

  const [timeFrame, setTimeFrame] = useState("daily");
  const [financialData, setFinancialData] = useState([]);
  const [showOverdue, setShowOverdue] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    invoiceCount: 0,
    paidInvoiceCount: 0,
    partialPaymentCount: 0,
    pendingInvoiceCount: 0,
  });

  useEffect(() => {
    // Get financial summary for selected time frame
    const data = getFinancialSummaryByPeriod(timeFrame);
    setFinancialData(data);

    // Calculate overall summary
    calculateFinancialSummary();
  }, [timeFrame, getFinancialSummaryByPeriod, invoices]);

  const calculateFinancialSummary = () => {
    // Get basic financial metrics
    const totalRevenue = getTotalRevenue() || 0;
    const pendingAmount = getTotalPendingAmount() || 0;
    const overduePayments = getOverduePayments() || [];
    const overdueAmount = overduePayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate invoice counts
    const invoiceCount = invoices?.length || 0;
    const paidInvoiceCount =
      invoices?.filter((inv) => inv.paymentStatus === "paid").length || 0;
    const partialPaymentCount =
      invoices?.filter((inv) => inv.paymentStatus === "partial").length || 0;
    const pendingInvoiceCount =
      invoices?.filter((inv) => inv.paymentStatus === "pending").length || 0;

    setSummary({
      totalRevenue,
      pendingAmount,
      overdueAmount,
      invoiceCount,
      paidInvoiceCount,
      partialPaymentCount,
      pendingInvoiceCount,
    });
  };

  const handleTimeFrameChange = (event, newValue) => {
    setTimeFrame(newValue);
  };

  const handleOverdueToggle = () => {
    setShowOverdue((prev) => !prev);
  };

  // Format date label for X-axis based on time frame
  const formatXAxisLabel = (value) => {
    if (!value) return "";

    if (timeFrame === "daily") {
      // Format as day (e.g., "May 5")
      const dateParts = value.split("-");
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (timeFrame === "weekly") {
      // Format as week (e.g., "W15")
      return `W${value.split("-")[1].substring(1)}`;
    } else {
      // Format as month (e.g., "May 2025")
      const dateParts = value.split("-");
      const date = new Date(dateParts[0], dateParts[1] - 1, 1);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  };

  // Get stacked bar chart data for payment status
  const getPaymentStatusData = () => {
    // Create sample data if needed
    return [
      {
        name: "Current Month",
        paid: summary.paidInvoiceCount,
        partial: summary.partialPaymentCount,
        pending: summary.pendingInvoiceCount,
      },
    ];
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "#ffffff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          p: 3,
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#1a237e", mb: 3 }}
        >
          Financial Summary
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} mb={4}>
          {/* Summary Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 3,
                border: "1px solid rgba(63, 81, 181, 0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                p: 3,
                height: "100%",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#666", fontWeight: 500, mb: 1 }}
              >
                Total Revenue
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#3f51b5", fontWeight: 700, mb: 1 }}
              >
                ${summary.totalRevenue.toFixed(2)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#888", fontWeight: 400 }}
              >
                From {summary.paidInvoiceCount} paid invoices
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 3,
                border: "1px solid rgba(255, 153, 0, 0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                p: 3,
                height: "100%",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#666", fontWeight: 500, mb: 1 }}
              >
                Pending Payments
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#ff9900", fontWeight: 700, mb: 1 }}
              >
                ${summary.pendingAmount.toFixed(2)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#888", fontWeight: 400 }}
              >
                From {summary.pendingInvoiceCount} pending invoices
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 3,
                border: "1px solid rgba(244, 67, 54, 0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                p: 3,
                height: "100%",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#666", fontWeight: 500, mb: 1 }}
              >
                Overdue Payments
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#f44336", fontWeight: 700, mb: 1 }}
              >
                ${summary.overdueAmount.toFixed(2)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#888", fontWeight: 400 }}
              >
                Payments exceeding due date
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 3,
                border: "1px solid rgba(76, 175, 80, 0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                p: 3,
                height: "100%",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#666", fontWeight: 500, mb: 1 }}
              >
                Payment Rate
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#4caf50", fontWeight: 700, mb: 1 }}
              >
                {summary.invoiceCount
                  ? `${Math.round(
                      (summary.paidInvoiceCount / summary.invoiceCount) * 100
                    )}%`
                  : "0%"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#888", fontWeight: 400 }}
              >
                Based on {summary.invoiceCount} total invoices
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Chart Section */}
        <Box mb={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#333" }}
            >
              Revenue Trend
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={showOverdue}
                    onChange={handleOverdueToggle}
                    color="primary"
                  />
                }
                label="Show Overdue"
                sx={{ mr: 2 }}
              />
              <Tabs
                value={timeFrame}
                onChange={handleTimeFrameChange}
                sx={{
                  "& .MuiTab-root": {
                    minWidth: 80,
                    fontSize: "0.85rem",
                  },
                }}
              >
                <Tab value="daily" label="Daily" />
                <Tab value="weekly" label="Weekly" />
                <Tab value="monthly" label="Monthly" />
              </Tabs>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: "#ffffff",
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              p: 3,
              height: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={financialData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={
                      timeFrame === "daily"
                        ? "date"
                        : timeFrame === "weekly"
                        ? "week"
                        : "month"
                    }
                    tickFormatter={formatXAxisLabel}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelFormatter={formatXAxisLabel}
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3f51b5"
                    fill="#3f51b5"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="2"
                    stroke="#ff9900"
                    fill="#ff9900"
                    fillOpacity={0.6}
                    name="Pending"
                  />
                  {showOverdue && (
                    <Area
                      type="monotone"
                      dataKey="overdue"
                      stackId="2"
                      stroke="#f44336"
                      fill="#f44336"
                      fillOpacity={0.6}
                      name="Overdue"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* Payment Status Chart */}
        <Box mb={4}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#333", mb: 2 }}
          >
            Payment Status Breakdown
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  p: 3,
                  height: "100%",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getPaymentStatusData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          border: "none",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="paid"
                        stackId="a"
                        name="Paid"
                        fill="#4caf50"
                      />
                      <Bar
                        dataKey="partial"
                        stackId="a"
                        name="Partial"
                        fill="#ff9900"
                      />
                      <Bar
                        dataKey="pending"
                        stackId="a"
                        name="Pending"
                        fill="#f44336"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  p: 3,
                  height: "100%",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#333", mb: 2 }}
                >
                  Payment Summary
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                            py: 1.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Total Invoices
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                            py: 1.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {summary.invoiceCount}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                            py: 1.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Paid
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                            py: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#4caf50" }}
                          >
                            {summary.paidInvoiceCount}
                            <span
                              style={{
                                fontWeight: 400,
                                color: "#666",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {summary.invoiceCount
                                ? `${Math.round(
                                    (summary.paidInvoiceCount /
                                      summary.invoiceCount) *
                                      100
                                  )}%`
                                : "0%"}
                              )
                            </span>
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                            py: 1.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Partial
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                            py: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#ff9900" }}
                          >
                            {summary.partialPaymentCount}
                            <span
                              style={{
                                fontWeight: 400,
                                color: "#666",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {summary.invoiceCount
                                ? `${Math.round(
                                    (summary.partialPaymentCount /
                                      summary.invoiceCount) *
                                      100
                                  )}%`
                                : "0%"}
                              )
                            </span>
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderBottom: "none", py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Pending
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ borderBottom: "none", py: 1.5 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#f44336" }}
                          >
                            {summary.pendingInvoiceCount}
                            <span
                              style={{
                                fontWeight: 400,
                                color: "#666",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {summary.invoiceCount
                                ? `${Math.round(
                                    (summary.pendingInvoiceCount /
                                      summary.invoiceCount) *
                                      100
                                  )}%`
                                : "0%"}
                              )
                            </span>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default FinancialSummary;
