import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import PrivateRoute from "./protected/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./error/ErrorBoundary";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllPdaValuesApi, getDashbordDetails } from "./services/apiService";
import Sidebar from "./views/Sidebar";
import Header from "./views/Header";
import Content from "./views/Content";
import SendOTP from "./auth/SendOTP";
import OtpVerification from "./auth/OtpVerification";
import ResetPassword from "./auth/ResetPassword";
import NotFound from "./views/NotFound";
import { ChatProvider } from "./views/ChatContext";
const App = () => {
  // State variables for each select option
  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [vesselTypes, setVesselTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Fetch PDA values on component mount
  useEffect(() => {
    const fetchPdaValues = async () => {
      try {
        const response = await getAllPdaValuesApi();
        if (response.status) {
          setVessels(response.vessels);
          setPorts(response.ports);
          setCargos(response.cargos);
          setVesselTypes(response.vesselTypes);
          setServices(response.services);
          setCustomers(response.customers);
        }
      } catch (error) {
        console.error("Error fetching PDA values:", error);
      }
    };

    fetchPdaValues();
  }, []);

  // <Router basename="/project/transocean">
  // https://transocean.srishtis.com/
  // "homepage": "https://hybrid.sicsglobal.com/project/transocean/",
  // "homepage": "https://transoceanonline.com/",

  // "homepage": "https://transocean.srishtis.com/",
  // REACT_APP_API_URL=https://hybrid.sicsglobal.com/transocean_api

  //stagging infos
  //   REACT_APP_API_URL=https://hybrid.sicsglobal.com/transocean_api/

  // REACT_APP_FILE_URL=https://hybrid.sicsglobal.com/transocean_api/assets/template_pdf/

  // REACT_APP_ASSET_URL = https://hybrid.sicsglobal.com/transocean_api/assets/

  //staggingproduction
  //   REACT_APP_API_URL=https://transocean.srishtis.com/transocean_api/

  // REACT_APP_FILE_URL=https://transocean.srishtis.com/transocean_api/assets/template_pdf/

  // REACT_APP_ASSET_URL = https://transocean.srishtis.com/transocean_api/assets/

  const [notFound, setNotFound] = useState(false);

  const handleNotFound = (value) => {
    setNotFound(value);
  };

  useEffect(() => {
    console.log(notFound, "notFound");
  }, [notFound]);

  return (
    <>
      <ErrorBoundary>
        <Router basename="/">
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/send-otp" element={<SendOTP />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <div
                      style={{
                        display: "flex",
                      }}
                    >
                      <Sidebar />
                      <div className="fullbody">
                        <Header />
                        <Content />
                      </div>
                    </div>
                  </PrivateRoute>
                }
              /> */}
              {notFound ? (
                <Route path="*" element={<NotFound />} />
              ) : (
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <ChatProvider>
                        <div style={{ display: "flex" }}>
                          <Sidebar />
                          <div className="fullbody">
                            <Header />
                            <Content onNotFound={handleNotFound} />
                          </div>
                        </div>
                      </ChatProvider>
                    </PrivateRoute>
                  }
                />
              )}
            </Routes>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
      <ToastContainer />
    </>
  );
};

export default App;
