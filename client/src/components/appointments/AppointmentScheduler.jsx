import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { useAppointment } from "../../contexts/AppointmentContext";
import { usePatient } from "../../contexts/PatientContext";
import { useAuth } from "../../contexts/AuthContext";
import { STORAGE_KEYS, getItem } from "../../utils/localStorage";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { generateEntityId } from "../../utils/idUtils";

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const AppointmentScheduler = () => {
  const { appointments, createAppointment, getAppointmentsByDateRange } =
    useAppointment();
  const { patients, getPatientById } = usePatient();
  const { user } = useAuth();

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date())
  );
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'day'
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Appointments state
  const [weekAppointments, setWeekAppointments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // New appointment dialog state
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] =
    useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentFees, setAppointmentFees] = useState(50);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  // Quick patient registration dialog state
  const [isPatientRegisterDialogOpen, setIsPatientRegisterDialogOpen] =
    useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    email: "",
    address: "",
  });

  // Get all doctors
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Load doctors from localStorage
    const users = getItem(STORAGE_KEYS.USERS, []);
    const doctorsList = users.filter((user) => user.role === "doctor");
    setDoctors(doctorsList);

    // Set first doctor as default if available
    if (doctorsList.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctorsList[0].id);
    }
  }, []);

  useEffect(() => {
    const loadAppointmentsForWeek = async () => {
      // Create an array of 7 days starting from currentWeekStart
      const weekDays = [...Array(7)].map((_, i) =>
        addDays(currentWeekStart, i)
      );
      const startDate = format(weekDays[0], "yyyy-MM-dd");
      const endDate = format(weekDays[6], "yyyy-MM-dd");

      // Fetch appointments for this date range
      const weekAppointments = await getAppointmentsByDateRange(
        startDate,
        endDate
      );
      setWeekAppointments(weekAppointments);
    };

    loadAppointmentsForWeek();
  }, [currentWeekStart, getAppointmentsByDateRange]);

  useEffect(() => {
    // Filter patients based on search query
    if (patientSearchQuery) {
      const filtered = patients.filter(
        (patient) =>
          patient.name
            .toLowerCase()
            .includes(patientSearchQuery.toLowerCase()) ||
          (patient.contact && patient.contact.includes(patientSearchQuery))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [patientSearchQuery, patients]);

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date()));
    setSelectedDay(new Date());
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setViewMode("day");
  };

  const handleTimeSlotSelect = (time, date) => {
    // Create a date object from date and time
    const dateStr = format(date, "yyyy-MM-dd");
    const dateTimeStr = `${dateStr}T${time}:00`;
    const selectedDateTime = new Date(dateTimeStr);

    setSelectedTimeSlot({ time, date: dateStr });
    setIsNewAppointmentDialogOpen(true);
  };

  // Check if a time slot is available
  const isSlotAvailable = (time, date) => {
    // Format date to match appointment date format
    const dateStr = format(date, "yyyy-MM-dd");

    // Check if there's an appointment at this time for the selected doctor
    const hasAppointment = weekAppointments.some(
      (appointment) =>
        appointment.date === dateStr &&
        appointment.startTime === time &&
        appointment.doctorId === selectedDoctor &&
        appointment.status !== "canceled" &&
        appointment.status !== "rejected"
    );

    return !hasAppointment;
  };

  const handleCreateAppointment = async () => {
    if (!selectedTimeSlot || !selectedDoctor || !selectedPatient) {
      alert("Please select a doctor, patient, and time slot");
      return;
    }

    // Calculate end time (30 min appointment)
    const timeParts = selectedTimeSlot.time.split(":");
    let endHour = parseInt(timeParts[0]);
    let endMinute = parseInt(timeParts[1]) + 30;

    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }

    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // Create appointment object
    const newAppointment = {
      id: generateEntityId(),
      patientId: selectedPatient.id,
      doctorId: selectedDoctor,
      date: selectedTimeSlot.date,
      startTime: selectedTimeSlot.time,
      endTime: endTime,
      status: "scheduled",
      reason: appointmentReason,
      notes: "",
      isFollowUp: false,
      previousAppointmentId: null,
      fees: appointmentFees,
      paymentStatus: "pending",
    };

    // Get doctor and patient names for display
    const doctor = doctors.find((d) => d.id === selectedDoctor);
    const patient = await getPatientById(selectedPatient.id);

    if (doctor) {
      newAppointment.doctorName = doctor.name;
    }

    if (patient) {
      newAppointment.patientName = patient.name;
    }

    // Create the appointment
    await createAppointment(newAppointment);

    // Refresh appointments for the week
    const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));
    const startDate = format(weekDays[0], "yyyy-MM-dd");
    const endDate = format(weekDays[6], "yyyy-MM-dd");
    const updatedAppointments = await getAppointmentsByDateRange(
      startDate,
      endDate
    );
    setWeekAppointments(updatedAppointments);

    // Reset form and close dialog
    setIsNewAppointmentDialogOpen(false);
    setSelectedTimeSlot(null);
    setSelectedPatient(null);
    setAppointmentReason("");
    setAppointmentFees(50);
  };

  const handleNewPatient = async () => {
    // Check required fields
    if (!newPatientData.name || !newPatientData.age) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new patient
    const newPatient = {
      id: generateEntityId(),
      ...newPatientData,
    };

    // Add patient to localStorage
    const existingPatients = getItem(STORAGE_KEYS.PATIENTS, []);
    const updatedPatients = [...existingPatients, newPatient];
    localStorage.setItem(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify(updatedPatients)
    );

    // Set as selected patient and close dialog
    setSelectedPatient(newPatient);
    setIsPatientRegisterDialogOpen(false);

    // Reset form
    setNewPatientData({
      name: "",
      age: "",
      gender: "Male",
      contact: "",
      email: "",
      address: "",
    });
  };

  const handleNewPatientFieldChange = (e) => {
    const { name, value } = e.target;
    setNewPatientData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? "" : parseInt(value)) : value,
    }));
  };

  const renderWeekView = () => {
    // Create an array of 7 days starting from currentWeekStart
    const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

    return (
      <Box>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "80px" }}>Time</TableCell>
                {weekDays.map((day, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      bgcolor: isSameDay(day, new Date())
                        ? "primary.light"
                        : "inherit",
                      color: isSameDay(day, new Date()) ? "white" : "inherit",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDaySelect(day)}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {WEEK_DAYS[day.getDay()]}
                      </Typography>
                      <Typography variant="body2">
                        {format(day, "MMM dd")}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map((time) => (
                <TableRow key={time} hover>
                  <TableCell sx={{ fontWeight: "bold" }}>{time}</TableCell>
                  {weekDays.map((day, dayIndex) => {
                    const isAvailable = isSlotAvailable(time, day);
                    const isPast = isBefore(
                      new Date(`${format(day, "yyyy-MM-dd")}T${time}`),
                      new Date()
                    );

                    // Find appointment at this slot if any
                    const appointment = weekAppointments.find(
                      (appt) =>
                        appt.date === format(day, "yyyy-MM-dd") &&
                        appt.startTime === time &&
                        appt.doctorId === selectedDoctor
                    );

                    return (
                      <TableCell
                        key={dayIndex}
                        align="center"
                        sx={{
                          bgcolor: isAvailable ? "inherit" : "grey.100",
                          cursor:
                            isAvailable && !isPast ? "pointer" : "not-allowed",
                          opacity: isPast ? 0.5 : 1,
                        }}
                        onClick={() => {
                          if (isAvailable && !isPast) {
                            handleTimeSlotSelect(time, day);
                          }
                        }}
                      >
                        {appointment ? (
                          <Chip
                            label={appointment.patientName || "Patient"}
                            color="primary"
                            size="small"
                          />
                        ) : (
                          isAvailable &&
                          !isPast && <AddIcon color="action" fontSize="small" />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderDayView = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {format(selectedDay, "EEEE, MMMM d, yyyy")}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map((time) => {
                const isAvailable = isSlotAvailable(time, selectedDay);
                const isPast = isBefore(
                  new Date(`${format(selectedDay, "yyyy-MM-dd")}T${time}`),
                  new Date()
                );

                // Find appointment at this slot if any
                const appointment = weekAppointments.find(
                  (appt) =>
                    appt.date === format(selectedDay, "yyyy-MM-dd") &&
                    appt.startTime === time &&
                    appt.doctorId === selectedDoctor
                );

                return (
                  <TableRow
                    key={time}
                    hover
                    sx={{
                      bgcolor: isAvailable ? "inherit" : "grey.100",
                      opacity: isPast ? 0.5 : 1,
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>{time}</TableCell>
                    <TableCell>
                      {appointment ? (
                        <Chip
                          label={appointment.status}
                          color={
                            appointment.status === "scheduled"
                              ? "primary"
                              : appointment.status === "checked-in"
                              ? "secondary"
                              : appointment.status === "in-progress"
                              ? "warning"
                              : appointment.status === "completed"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="Available"
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {appointment ? appointment.patientName : "-"}
                    </TableCell>
                    <TableCell>
                      {appointment ? appointment.reason : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {!appointment && !isPast && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() =>
                            handleTimeSlotSelect(time, selectedDay)
                          }
                        >
                          Book
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" component="h2">
          Appointment Scheduler
        </Typography>

        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowLeftIcon />}
            onClick={goToPreviousWeek}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Button variant="contained" onClick={goToToday} sx={{ mr: 1 }}>
            Today
          </Button>
          <Button
            variant="outlined"
            endIcon={<ArrowRightIcon />}
            onClick={goToNextWeek}
          >
            Next
          </Button>
        </Box>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">
          {format(currentWeekStart, "MMMM d, yyyy")} -{" "}
          {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
        </Typography>

        <Box display="flex" alignItems="center">
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 200, mr: 2 }}
          >
            <InputLabel>Select Doctor</InputLabel>
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              label="Select Doctor"
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={() => setViewMode(viewMode === "week" ? "day" : "week")}
          >
            {viewMode === "week" ? "Day View" : "Week View"}
          </Button>
        </Box>
      </Box>

      {viewMode === "week" ? renderWeekView() : renderDayView()}

      {/* New Appointment Dialog */}
      <Dialog
        open={isNewAppointmentDialogOpen}
        onClose={() => setIsNewAppointmentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Appointment Details
              </Typography>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date & Time
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedTimeSlot &&
                    `${selectedTimeSlot.date} at ${selectedTimeSlot.time}`}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Doctor
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {doctors.find((d) => d.id === selectedDoctor)?.name || ""}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Appointment Reason"
                variant="outlined"
                margin="normal"
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
              />

              <TextField
                fullWidth
                label="Appointment Fees"
                variant="outlined"
                margin="normal"
                type="number"
                value={appointmentFees}
                onChange={(e) => setAppointmentFees(Number(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <Box component="span" mr={1}>
                      $
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle2">Select Patient</Typography>
                <Button
                  startIcon={<PersonAddIcon />}
                  onClick={() => setIsPatientRegisterDialogOpen(true)}
                  size="small"
                >
                  Quick Register
                </Button>
              </Box>

              <Autocomplete
                fullWidth
                options={filteredPatients}
                getOptionLabel={(option) => option.name}
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Patient"
                    variant="outlined"
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                  />
                )}
              />

              {selectedPatient && (
                <Box
                  mt={2}
                  p={2}
                  border={1}
                  borderColor="grey.300"
                  borderRadius={1}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Patient Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedPatient.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Age:</strong> {selectedPatient.age}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gender:</strong> {selectedPatient.gender}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {selectedPatient.contact || "N/A"}
                  </Typography>
                  {selectedPatient.insurance && (
                    <Typography variant="body2">
                      <strong>Insurance:</strong>{" "}
                      {selectedPatient.insurance.provider || "None"}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewAppointmentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAppointment}
            disabled={!selectedPatient}
          >
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Patient Registration Dialog */}
      <Dialog
        open={isPatientRegisterDialogOpen}
        onClose={() => setIsPatientRegisterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quick Patient Registration</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="name"
                value={newPatientData.name}
                onChange={handleNewPatientFieldChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Age"
                name="age"
                type="number"
                value={newPatientData.age}
                onChange={handleNewPatientFieldChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={newPatientData.gender}
                  onChange={handleNewPatientFieldChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={newPatientData.contact}
                onChange={handleNewPatientFieldChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newPatientData.email}
                onChange={handleNewPatientFieldChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={newPatientData.address}
                onChange={handleNewPatientFieldChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPatientRegisterDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNewPatient}
            disabled={!newPatientData.name || !newPatientData.age}
          >
            Register Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AppointmentScheduler;
