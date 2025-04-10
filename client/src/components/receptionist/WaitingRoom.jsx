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
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { formatDistanceStrict } from "date-fns";
import { useWaitingRoom } from "../../contexts/WaitingRoomContext";
import { useAppointment } from "../../contexts/AppointmentContext";
import { useAuth } from "../../contexts/AuthContext";

const WaitingRoom = () => {
  const {
    waitingRoom,
    updatePatientPriority,
    startAppointment,
    checkOutPatient,
  } = useWaitingRoom();
  const {
    appointments,
    getAppointmentById,
    getAppointmentsForToday,
    updateAppointmentStatus,
  } = useAppointment();
  const { user } = useAuth();

  const [waitingPatients, setWaitingPatients] = useState([]);
  const [inProgressPatients, setInProgressPatients] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [priorityValue, setPriorityValue] = useState(1);

  // Force re-render every minute to update the waiting times
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Get patients from the waiting room
  useEffect(() => {
    if (waitingRoom && waitingRoom.currentQueue) {
      const waiting = waitingRoom.currentQueue.filter(
        (patient) => patient.status === "waiting"
      );
      const inProgress = waitingRoom.currentQueue.filter(
        (patient) => patient.status === "in-progress"
      );

      setWaitingPatients(waiting);
      setInProgressPatients(inProgress);
    }
  }, [waitingRoom, updateTrigger]);

  const handleChangePriority = (patient) => {
    setSelectedPatient(patient);
    setPriorityValue(patient.priority);
    setPriorityDialogOpen(true);
  };

  const handleSavePriority = () => {
    if (selectedPatient) {
      updatePatientPriority(selectedPatient.appointmentId, priorityValue);
    }
    setPriorityDialogOpen(false);
  };

  const handleStartAppointment = async (patient) => {
    // Start the appointment
    startAppointment(patient.appointmentId);

    // Update appointment status in AppointmentContext
    const appointment = await getAppointmentById(patient.appointmentId);
    if (appointment) {
      updateAppointmentStatus(appointment.id, "in-progress");
    }
  };

  const handleCompleteAppointment = async (patient) => {
    // Check out the patient from waiting room
    checkOutPatient(patient.appointmentId);

    // Update appointment status in AppointmentContext
    const appointment = await getAppointmentById(patient.appointmentId);
    if (appointment) {
      updateAppointmentStatus(appointment.id, "completed");
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 0:
        return (
          <Chip
            label="Urgent"
            color="error"
            size="small"
            icon={<PriorityHighIcon />}
          />
        );
      case 1:
        return <Chip label="Normal" color="primary" size="small" />;
      case 2:
        return <Chip label="Low" color="success" size="small" />;
      default:
        return <Chip label="Normal" color="primary" size="small" />;
    }
  };

  const getWaitTimeDisplay = (patient) => {
    if (!patient.checkedInTime) return "N/A";

    const waitTime = formatDistanceStrict(
      new Date(),
      new Date(patient.checkedInTime),
      { addSuffix: false }
    );

    return waitTime;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" mb={3}>
          Waiting Room Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "#f5f5f5", height: "100%" }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">
                    <Badge
                      badgeContent={waitingPatients.length}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Waiting
                    </Badge>
                  </Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Wait Time</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {waitingPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              py={2}
                            >
                              No patients waiting
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        waitingPatients.map((patient) => (
                          <TableRow key={patient.appointmentId}>
                            <TableCell>{patient.patientName}</TableCell>
                            <TableCell>{patient.doctorName}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <AccessTimeIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: "text.secondary" }}
                                />
                                {getWaitTimeDisplay(patient)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ cursor: "pointer" }}
                                onClick={() => handleChangePriority(patient)}
                              >
                                {getPriorityLabel(patient.priority)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleStartAppointment(patient)}
                                title="Start Appointment"
                              >
                                <ArrowForwardIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "#f5f5f5", height: "100%" }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">
                    <Badge
                      badgeContent={inProgressPatients.length}
                      color="secondary"
                      sx={{ mr: 1 }}
                    >
                      In Progress
                    </Badge>
                  </Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inProgressPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              py={2}
                            >
                              No appointments in progress
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        inProgressPatients.map((patient) => (
                          <TableRow key={patient.appointmentId}>
                            <TableCell>{patient.patientName}</TableCell>
                            <TableCell>{patient.doctorName}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <AccessTimeIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: "text.secondary" }}
                                />
                                {getWaitTimeDisplay(patient)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  handleCompleteAppointment(patient)
                                }
                                title="Complete Appointment"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Change Priority Dialog */}
      <Dialog
        open={priorityDialogOpen}
        onClose={() => setPriorityDialogOpen(false)}
      >
        <DialogTitle>Change Patient Priority</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={priorityValue}
                onChange={(e) => setPriorityValue(e.target.value)}
                label="Priority"
              >
                <MenuItem value={0}>Urgent</MenuItem>
                <MenuItem value={1}>Normal</MenuItem>
                <MenuItem value={2}>Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriorityDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSavePriority}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WaitingRoom;
