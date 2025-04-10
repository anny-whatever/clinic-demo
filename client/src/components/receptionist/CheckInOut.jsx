import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { format } from "date-fns";
import { useAppointment } from "../../contexts/AppointmentContext";
import { useWaitingRoom } from "../../contexts/WaitingRoomContext";
import { usePatient } from "../../contexts/PatientContext";

const CheckInOut = () => {
  const { appointments, getAppointmentsForToday, updateAppointmentStatus } =
    useAppointment();
  const { checkInPatient, isPatientInWaitingRoom } = useWaitingRoom();
  const { getPatientById } = usePatient();

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      const appointments = await getAppointmentsForToday();
      setTodayAppointments(appointments);
      setFilteredAppointments(appointments);
    };

    fetchTodayAppointments();
  }, [getAppointmentsForToday]);

  useEffect(() => {
    // Filter appointments based on search query and status filter
    const filterAppointments = () => {
      let filtered = [...todayAppointments];

      // Apply search filter
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (app) =>
            (app.patientName &&
              app.patientName.toLowerCase().includes(lowerQuery)) ||
            (app.doctorName &&
              app.doctorName.toLowerCase().includes(lowerQuery))
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((app) => app.status === statusFilter);
      }

      setFilteredAppointments(filtered);
    };

    filterAppointments();
  }, [todayAppointments, searchQuery, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleCheckIn = async (appointment) => {
    // Check if the appointment exists
    if (!appointment) return;

    // Get patient and doctor details
    const patient = await getPatientById(appointment.patientId);
    // In a real app, you would get the doctor from a doctor context
    const doctor = {
      id: appointment.doctorId,
      name: appointment.doctorName || "Doctor",
    };

    if (!patient) {
      alert("Patient not found");
      return;
    }

    setSelectedAppointment(appointment);
    setSelectedPatient(patient);
    setSelectedDoctor(doctor);
    setCheckInDialogOpen(true);
  };

  const handleConfirmCheckIn = async () => {
    try {
      // Check if patient is already in waiting room
      if (isPatientInWaitingRoom(selectedAppointment.id)) {
        alert("This patient is already checked in");
        setCheckInDialogOpen(false);
        return;
      }

      // Add to waiting room
      const checkInResult = checkInPatient(
        selectedAppointment,
        selectedPatient,
        selectedDoctor
      );

      // Update appointment status
      await updateAppointmentStatus(selectedAppointment.id, "checked-in", {
        checkedInTime: new Date().toISOString(),
      });

      // Refresh the appointment list
      const appointments = await getAppointmentsForToday();
      setTodayAppointments(appointments);

      setCheckInDialogOpen(false);
      alert(`${selectedPatient.name} has been checked in successfully.`);
    } catch (error) {
      console.error("Check-in failed:", error);
      alert("Failed to check in patient.");
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "scheduled":
        return <Chip label="Scheduled" color="primary" size="small" />;
      case "checked-in":
        return (
          <Chip
            label="Checked In"
            color="secondary"
            size="small"
            icon={<CheckCircleIcon />}
          />
        );
      case "in-progress":
        return (
          <Chip
            label="In Progress"
            color="warning"
            size="small"
            icon={<ScheduleIcon />}
          />
        );
      case "completed":
        return (
          <Chip
            label="Completed"
            color="success"
            size="small"
            icon={<DoneAllIcon />}
          />
        );
      case "canceled":
        return <Chip label="Canceled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" mb={3}>
          Patient Check-in / Check-out
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search Patient or Doctor"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status Filter"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="checked-in">Checked In</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Card variant="outlined">
          <CardContent>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          py={2}
                        >
                          No appointments found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {appointment.startTime} - {appointment.endTime}
                        </TableCell>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>{appointment.doctorName}</TableCell>
                        <TableCell>
                          <Typography noWrap style={{ maxWidth: 150 }}>
                            {appointment.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(appointment.status)}
                        </TableCell>
                        <TableCell>
                          {appointment.status === "scheduled" && (
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => handleCheckIn(appointment)}
                            >
                              Check In
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Paper>

      {/* Check-in Confirmation Dialog */}
      <Dialog
        open={checkInDialogOpen}
        onClose={() => setCheckInDialogOpen(false)}
      >
        <DialogTitle>Patient Check-in</DialogTitle>
        <DialogContent dividers>
          {selectedPatient && selectedAppointment && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPatient.name}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Appointment Time
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.startTime} -{" "}
                    {selectedAppointment.endTime}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1">
                    {selectedDoctor?.name || "Unknown Doctor"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Reason for Visit
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.reason}
                  </Typography>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Current Time: {format(new Date(), "h:mm a")}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCheckIn}
            variant="contained"
            color="primary"
          >
            Confirm Check-in
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckInOut;
