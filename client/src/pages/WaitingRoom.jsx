import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import WaitingRoomComponent from "../components/receptionist/WaitingRoom";
import CheckInOut from "../components/receptionist/CheckInOut";
import { useAuth } from "../contexts/AuthContext";

const WaitingRoom = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const isReceptionist = user && user.role === "receptionist";

  if (!isReceptionist) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Only receptionists can access the waiting room management page.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" component="h1" mb={2}>
          Waiting Room Management
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="waiting room tabs"
        >
          <Tab icon={<PeopleIcon />} label="Waiting Room" />
          <Tab icon={<HowToRegIcon />} label="Check-in / Check-out" />
        </Tabs>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {activeTab === 0 ? <WaitingRoomComponent /> : <CheckInOut />}
    </Container>
  );
};

export default WaitingRoom;
