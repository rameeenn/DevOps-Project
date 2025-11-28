import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectRoute from "./components/ProtectLogin"

import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import PatientAppointmentsHome from "./components/PatientAppointmentsHome";
import AmbulanceHomePage from "./components/AmbulanceHomePage";
import PatientLabTest from "./components/PatientLabTests";
import ViewLabReport from "./components/ViewLabReportsHome";
import OrderMedicine from "./components/MedicineHomePage";
import Articles from "./components/ArticlesHomePage";
import Chat from "./components/ChatPage";
import Profile from "./components/PatientProfile";
import Report from "./components/PatientLabTestReport"
import RescheduleLabTest from "./components/RescheduleLabTest";
import RescheduleAppointment from "./components/RescheduleAppointment";
import BookAppointment from "./components/BookAppointment";
import BookLabTest from "./components/BookLabTest";
import MedicineCheckout from "./components/MedicineCheckout";
import ArticlePage from "./components/ArticlePage";
import ConfirmAppointment from "./components/ConfirmAppointment";
import LabStaffDashboard from "./components/LabStaffDashboard";
import UpcomingLabAppointments from "./components/UpcomingLabAppointments";
import LabTestReport from "./components/LabTestReport";
import LabStaffProfile from "./components/LabStaffProfile";
import SignUp from "./components/SignUpPage"

import DoctorHome from './components/DoctorProfile';
import ProfileSettings from './components/ProfileSettings';
import MySchedule from './components/MySchedule';
import ViewPatients from './components/ViewPatients';
import PatientReport from './components/PatientReport';
import Consultation from './components/Consultation';
import ChatRoom from './components/ChatRoom';
import DoctorProfile from "./components/DoctorProfile7";
import Chats from './components/chats';
import PatientHistory from './components/PatientHistory';

import AdminHome from './components/AdminHome';
import AdminProfile from './components/AdminProfile';
import ManageUser from './components/ManageUsers';
import EditUser from './components/EditUser';
import ManageStock from './components/ManageStock';
function App() {
  return (
    <div>
      <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/doctor/Profile" element={<ProfileSettings />} />
            <Route path="/doctor/schedule" element={<MySchedule />} />
            <Route path="/doctor/patients" element={<ViewPatients />} />
            <Route path="/doctor/reports" element={<PatientReport />} />
            <Route path="/doctor/consultations" element={<Consultation />} />
            <Route path="/chat-room" element={<ChatRoom />} />
            <Route path="/doctor/chats" element={<Chats />} />
            <Route path="/doctor/patient-history" element={<PatientHistory />} />
            <Route path="/d" element={<DoctorHome />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />

            <Route path="/a" element={<AdminHome/>} />
            <Route path="/manage-users" element={<ManageUser />} />
            <Route path="/edit-user/:id" element={<EditUser />} />
            <Route path="/manage-stock" element={<ManageStock />} />
            <Route path="/admin-profile" element={<AdminProfile />} />

            {/* doctor-profile */}
            <Route
              path="/ambulance"
              element={
                <ProtectRoute>
                  <AmbulanceHomePage />
                </ProtectRoute>
              }
            />
            <Route
              path="/appointment"
              element={
                <ProtectRoute>
                  <PatientAppointmentsHome />
                </ProtectRoute>
              }
            />
            <Route
              path="/confirmApp/:id"
              element={
                <ProtectRoute>
                  <ConfirmAppointment />
                </ProtectRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectRoute>
                  <ViewLabReport />
                </ProtectRoute>
              }
            />
            <Route
              path="/reshedule/:id"
              element={
                <ProtectRoute>
                  <RescheduleAppointment />
                </ProtectRoute>
              }
            />
            <Route
              path="/lab-test"
              element={
                <ProtectRoute>
                  <PatientLabTest />
                </ProtectRoute>
              }
            />
            <Route
              path="/viewreports/:id"
              element={
                <ProtectRoute>
                  <Report />
                </ProtectRoute>
              }
            />
            <Route
              path="/book"
              element={
                <ProtectRoute>
                  <BookAppointment />
                </ProtectRoute>
              }
            />
            <Route
              path="/booklab/:id"
              element={
                <ProtectRoute>
                  <BookLabTest />
                </ProtectRoute>
              }
            />
            <Route
              path="/reshedulelab/:id"
              element={
                <ProtectRoute>
                  <RescheduleLabTest />
                </ProtectRoute>
              }
            />

            <Route
              path="/ordermedicine"
              element={
                <ProtectRoute>
                  <OrderMedicine />
                </ProtectRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectRoute>
                  < MedicineCheckout />
                </ProtectRoute>
              }
            />

            <Route
              path="/contact"
              element={
                <ProtectRoute>
                  <Chat />
                </ProtectRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectRoute>
                  <Profile />
                </ProtectRoute>
              }
            />
            <Route
              path="/lprofile"
              element={
                <ProtectRoute>
                  <LabStaffProfile />
                </ProtectRoute>
              }
            />

            <Route
              path="/readarticle/:id"
              element={
                <ProtectRoute>
                  <ArticlePage />
                </ProtectRoute>
              }
            />

            <Route
              path="/SignUp"
              element={

                <SignUp />

              }
            />

            <Route
              path="/labstaff"
              element={
                <ProtectRoute>
                  <LabStaffDashboard />
                </ProtectRoute>
              }
            />
            <Route
              path="/upcomingAppointment"
              element={
                <ProtectRoute>
                  <UpcomingLabAppointments />
                </ProtectRoute>
              }
            />
            <Route
              path="/labstaffreport"
              element={
                <ProtectRoute>
                  <LabTestReport />
                </ProtectRoute>
              }
            />

          </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
