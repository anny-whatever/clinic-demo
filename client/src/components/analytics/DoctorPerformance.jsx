import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { useAnalytics } from "../../contexts/AnalyticsContext";

const DoctorPerformance = () => {
  const {
    getDoctorPerformance,
    getCompletionRateByDoctor,
    getWaitingTimeStats,
  } = useAnalytics();

  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [waitingTimeStats, setWaitingTimeStats] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("appointmentsCompleted");

  // Colors for charts
  const CHART_COLORS = [
    "#3f51b5",
    "#4caf50",
    "#ff9800",
    "#f44336",
    "#9c27b0",
    "#2196f3",
  ];
  const PIE_COLORS = ["#4caf50", "#3f51b5", "#ff9800", "#f44336"];

  useEffect(() => {
    // Get doctor performance data
    const performance = getDoctorPerformance() || [];
    setDoctorPerformance(performance);

    // Get waiting time stats
    const waitStats = getWaitingTimeStats();

    if (waitStats && waitStats.doctorWaitTimes) {
      setWaitingTimeStats(waitStats.doctorWaitTimes);
    }

    // Get completion rates
    const compRates = getCompletionRateByDoctor() || [];
    setCompletionRates(compRates);
  }, [getDoctorPerformance, getWaitingTimeStats, getCompletionRateByDoctor]);

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // Format data for bar chart
  const formatChartData = () => {
    return doctorPerformance.map((doc) => ({
      doctorId: doc.doctorId,
      doctorName: `Dr. ${doc.doctorId.slice(0, 4)}`, // Use doctorId as name for demo
      [selectedMetric]: doc[selectedMetric],
    }));
  };

  // Format data for completion rate pie chart
  const formatCompletionRateData = () => {
    return completionRates.map((doc) => ({
      doctorId: doc.doctorId,
      doctorName: `Dr. ${doc.doctorId.slice(0, 4)}`,
      completionRate: Math.round(doc.completionRate * 100),
      completedAppointments: doc.completedAppointments,
      totalAppointments: doc.totalAppointments,
    }));
  };

  // Get metric label for the chart
  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "appointmentsCompleted":
        return "Appointments Completed";
      case "averageDuration":
        return "Average Duration (min)";
      case "cancelationRate":
        return "Cancellation Rate";
      case "averageWaitTime":
        return "Average Wait Time (min)";
      case "revenue":
        return "Revenue ($)";
      default:
        return selectedMetric;
    }
  };

  const formatValue = (value, metric) => {
    switch (metric) {
      case "cancelationRate":
        return `${(value * 100).toFixed(1)}%`;
      case "revenue":
        return `$${value.toFixed(2)}`;
      default:
        return value;
    }
  };

  // Custom tooltip component for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "#fff",
            p: 2,
            borderRadius: 1,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="subtitle2" sx={{ color: "#1a237e" }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: payload[0].color }}>
            {`${getMetricLabel()}: ${formatValue(
              payload[0].value,
              selectedMetric
            )}`}
          </Typography>
        </Box>
      );
    }
    return null;
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
          Doctor Performance Metrics
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Performance Metrics Chart */}
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
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1a237e" }}
                >
                  Performance Comparison
                </Typography>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 200 }}
                >
                  <InputLabel>Metric</InputLabel>
                  <Select
                    value={selectedMetric}
                    onChange={handleMetricChange}
                    label="Metric"
                    sx={{
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                    }}
                  >
                    <MenuItem value="appointmentsCompleted">
                      Appointments Completed
                    </MenuItem>
                    <MenuItem value="averageDuration">
                      Average Duration
                    </MenuItem>
                    <MenuItem value="cancelationRate">
                      Cancellation Rate
                    </MenuItem>
                    <MenuItem value="averageWaitTime">
                      Average Wait Time
                    </MenuItem>
                    <MenuItem value="revenue">Revenue</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="doctorName"
                      tick={{ fill: "#757575" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                      tickLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fill: "#757575" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                      tickLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar
                      dataKey={selectedMetric}
                      fill="#3f51b5"
                      name={getMetricLabel()}
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Completion Rate Pie Chart */}
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
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1a237e", mb: 3 }}
              >
                Appointment Completion Rate
              </Typography>

              <Box height={300} display="flex" justifyContent="center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatCompletionRateData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="completedAppointments"
                      nameKey="doctorName"
                      label={({ completionRate }) => `${completionRate}%`}
                      paddingAngle={2}
                    >
                      {formatCompletionRateData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        return [
                          `${value} (${props.payload.completionRate}%)`,
                          `${name} Completed`,
                        ];
                      }}
                      contentStyle={{
                        borderRadius: 8,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "none",
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: "#1a237e" }}>{value}</span>
                      )}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Performance Table */}
          <Grid item xs={12}>
            <Box
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                p: 3,
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1a237e", mb: 3 }}
              >
                Doctor Performance Details
              </Typography>

              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>
                        Doctor
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "#1a237e" }}
                      >
                        Appointments
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "#1a237e" }}
                      >
                        Avg. Duration
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "#1a237e" }}
                      >
                        Cancellation Rate
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "#1a237e" }}
                      >
                        Wait Time
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "#1a237e" }}
                      >
                        Revenue
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "#1a237e" }}
                      >
                        Completion
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {doctorPerformance.map((doc) => {
                      // Find completion rate for this doctor
                      const completeRate = completionRates.find(
                        (r) => r.doctorId === doc.doctorId
                      );
                      const completionPercentage = completeRate
                        ? completeRate.completionRate * 100
                        : 0;

                      return (
                        <TableRow key={doc.doctorId} hover>
                          <TableCell component="th" scope="row">
                            Dr. {doc.doctorId.slice(0, 4)}
                          </TableCell>
                          <TableCell align="right">
                            {doc.appointmentsCompleted}
                          </TableCell>
                          <TableCell align="right">
                            {doc.averageDuration} min
                          </TableCell>
                          <TableCell align="right">
                            {(doc.cancelationRate * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell align="right">
                            {doc.averageWaitTime} min
                          </TableCell>
                          <TableCell align="right">${doc.revenue}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={completionPercentage}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "#e0e0e0",
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 4,
                                      backgroundColor:
                                        completionPercentage > 75
                                          ? "#4caf50"
                                          : completionPercentage > 50
                                          ? "#ff9800"
                                          : "#f44336",
                                    },
                                  }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {completionPercentage.toFixed(0)}%
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DoctorPerformance;
