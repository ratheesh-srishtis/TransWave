import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import NotificationPage from "./NotificationPage";
import { getUnreadNotificationCount } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import Notificationhr from "./Notificationhr";
import {
  getAllChatMessages,
  getTotalUnreadChatCount,
} from "../services/chatApiService";
import { useChat } from "./ChatContext";
const Header = () => {
  const navigate = useNavigate();
  const { logout, loginResponse } = useAuth();
  const Rectangle = require("../assets/images/Rectangle 1393.png");
  let seettings_img = "";
  if (loginResponse.data.userRole.roleType == "hr")
    seettings_img = require("../assets/images/settings.png");
  const notification_img = require("../assets/images/Notifications.png");
  //console.log(loginResponse, "loginResponseHEader");
  const location = useLocation();
  // Determine the heading text based on the current path
  const getHeaderText = () => {
    //console.log(location.pathname, "location.pathname");
    if (location.pathname.includes("/dashboard")) {
      return "Dashboard";
    } else if (location.pathname.includes("/create-pda")) {
      return location.state && location.state.row
        ? "Update PDA"
        : "Create New PDA";
    } else if (location.pathname.includes("/quotations")) {
      return "Quotations";
    } else if (location.pathname.includes("/jobs")) {
      return "Jobs";
    } else if (location.pathname.includes("/payments")) {
      return "Payments";
    } else if (location.pathname.includes("/soa")) {
      return "SOA";
    } else if (location.pathname == "/") {
      return "Dashboard";
    } else if (location.pathname == "/roles-settings") {
      return "Roles Settings";
    } else if (location.pathname == "/user-settings") {
      return "User Settings";
    } else if (location.pathname == "/vessels-settings") {
      return "Vessel Settings";
    } else if (location.pathname == "/vessel-type-settings") {
      return "Vessel Type Settings";
    } else if (location.pathname == "/ports-settings") {
      return "Port Settings";
    } else if (location.pathname == "/customer-settings") {
      return "Customer Settings";
    } else if (location.pathname == "/service-settings") {
      return "Service Settings";
    } else if (location.pathname == "/charges-settings") {
      return "Charge Settings";
    } else if (location.pathname == "/sub-charges-settings") {
      return "Sub Charge Settings";
    } else if (location.pathname == "/cargo-settings") {
      return "Cargo Settings";
    } else if (location.pathname == "/anchorage-locations") {
      return "Anchorage Location Settings";
    } else if (location.pathname == "/vendor-settings") {
      return "Vendor Settings";
    } else if (location.pathname == "/QQform-settings") {
      return "QQ Form Settings";
    } else if (location.pathname == "/password-requests") {
      return "Password Reset Request";
    } else if (location.pathname == "/edit-operation") {
      return "Update Jobs";
    } else if (location.pathname == "/final-report") {
      return "Final Report";
    } else if (location.pathname == "/job-report") {
      return "Job Report";
    } else if (location.pathname == "/view-operation") {
      return "View Job";
    } else if (location.pathname == "/view-quotation") {
      return "View Quotation";
    } else if (location.pathname == "/vendorpayment") {
      return "Vendor Payments";
    } else if (location.pathname == "/customerpayment") {
      return "Customer Payments";
    } else if (location.pathname == "/vendorvouchers") {
      return "Petty Payments";
    } else if (location.pathname == "/Bank-settings") {
      return "Bank Settings";
    } else if (location.pathname.includes("/add-employee")) {
      return location.state?.isEditing
        ? "Update Employee Details"
        : "Add Employee";
    } else if (location.pathname == "/petty-cash-report") {
      return "Petty Cash Report";
    } else if (location.pathname == "/cost-centre-breakup") {
      return "Cost Centre Breakup (Job)";
    } else if (location.pathname == "/cost-centre-summary") {
      return "Cost Centre Summary - Monthly";
    } else if (location.pathname == "/recievable-summary") {
      return "Receivable Summary";
    } else if (location.pathname == "/payable-summary") {
      return "Payable Summary";
    } else if (location.pathname == "/bank-summary") {
      return "Bank Summary";
    } else if (location.pathname == "/employeePetty") {
      return "Employee Petty Payments";
    } else if (location.pathname == "/hr-settings") {
      return "Settings";
    } else if (location.pathname == "/employee-leaves") {
      return "Leave History";
    } else if (location.pathname == "/workcalendar") {
      return "Work Calendar";
    } else if (location.pathname == "/desiginations") {
      return "Designations";
    } else if (location.pathname == "/leavereports") {
      return "Leave Reports";
    } else if (location.pathname == "/general-documents") {
      return "General Documents";
    } else if (location.pathname == "/stay-charge") {
      return "Anchorage Stay Charge";
    }

    // Add more conditions as needed for other routes
    let file = location.pathname.slice(1);
    return file.charAt(0).toUpperCase() + file.slice(1);
  };

  const [open, setOpen] = useState(false);

  const openDialog = () => {
    if (loginResponse?.data?.userRole?.roleType?.toLowerCase() == "hr") {
      handleHRNotificationOpen();
    } else {
      handleClickOpen();
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [HRNotificationOpen, setHRNotificationOpen] = useState(false);

  const openHRNotificationDialog = () => {
    handleHRNotificationOpen();
  };

  const handleHRNotificationOpen = () => {
    setHRNotificationOpen(true);
  };

  const HRNotificationHandleClose = () => {
    setHRNotificationOpen(false);
  };

  const [notificationCount, setNotificationCount] = useState("");
  const handleRedirect = () => {
    navigate("/hr-settings");
  };

  const getNotificationCount = async (type, data) => {
    console.log(type, data, "count_manage");
    if (type == "opened") {
      setNotificationCount(data);
    } else {
      let payload = {
        userId: loginResponse?.data?._id,
      };
      try {
        const response = await getUnreadNotificationCount(payload);
        setNotificationCount(response?.unreadCount);
        console.log("getNotificationCount", response);
      } catch (error) {
        console.error("Failed to fetch quotations:", error);
      }
    }
  };

  // const getLatestNotificationCount = async (data) => {
  //   // alert(data);
  //   let payload = {
  //     userId: loginResponse?.data?._id,
  //   };
  //   try {
  //     const response = await getUnreadNotificationCount(payload);
  //     setNotificationCount(response?.unreadCount);
  //     console.log("getNotificationCount", response);
  //   } catch (error) {
  //     console.error("Failed to fetch quotations:", error);
  //   }
  // };

  useEffect(() => {
    console.log(notificationCount, "notificationCount");
  }, [notificationCount]);

  const openChat = () => {
    navigate("/chats");
  };

  const { messageCount, getChatUnreadCount } = useChat();

  // useEffect(() => {
  //   getChatUnreadCount();
  // }, []); // Runs once on mount

  useEffect(() => {
    getChatUnreadCount();

    getNotificationCount();
  }, [location.pathname]); // Runs whenever the path changes

  const formatUserType = (receiverType) => {
    if (!receiverType) return "";

    // Special case for 'hr'
    if (receiverType.toLowerCase() === "hr") {
      return "HR";
    }

    // Capitalize the first letter for other cases
    return receiverType.charAt(0).toUpperCase() + receiverType.slice(1);
  };

  return (
    // <header style={{ backgroundColor: "#f8f9fa", padding: "10px 20px" }}>
    //   <h1>My App</h1>
    //   <button onClick={logout}>Logout</button>
    // </header>3
    <>
      <div className="main--content">
        <div className="header--wrapper">
          <div className="header--title">
            <h5>{getHeaderText()}</h5>
            <div className="version">Version: 0.002</div>
          </div>

          <div className="d-flex flex-row-reverse marginnew ">
            <div className="btn-group">
              <img src={Rectangle} className="userimg"></img>
              <button
                type="button"
                className="admin-button text-start namefinance"
              >
                {formatUserType(loginResponse?.data?.userRole?.roleType)}

                <div className="nameuser">{loginResponse?.data?.name}</div>
              </button>
              <button
                type="button"
                className=" downarrow dropdown-toggle dropdown-toggle-split split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              ></button>
              <ul className="dropdown-menu">
                {/* <li>
                  <a className="dropdown-item" href="#">
                    Admin
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Finance
                  </a>
                </li>
                <li className="usersep">
                  <a className="dropdown-item" href="#">
                    Operations
                  </a>
                </li> */}
                <li className="signoutmain" onClick={logout}>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-box-arrow-left"></i>
                    <span className="px-2">Signout</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="p-2 chatnotification">
              <button
                type="button"
                className="btn btn-success px-4 py-1.7 btnsignout"
                onClick={() => {
                  openChat();
                }}
              >
                {" "}
                <i className="bi bi-chat-text"></i>{" "}
                <span className="chatt">Chats</span>{" "}
              </button>
              <div className="chatnotifnumber">
                {messageCount ? messageCount : 0}
              </div>
            </div>
            <div
              className="notificationbell"
              onClick={() => {
                openDialog();
              }}
            >
              <img src={notification_img} className="bellicon"></img>
              <div className=" notificationnumber">
                {notificationCount ? notificationCount : 0}
              </div>
            </div>
            <div className="notificationbell">
              <img
                src={seettings_img}
                className="bellicon"
                onClick={handleRedirect}
              ></img>
            </div>
            {/* <div className="p-2">
              <div className="notification">
                <div>
                  <i className="bi bi-exclamation-triangle-fill alert"></i>
                  <span className="new"> New Message</span>
                  <h6> PDA’s are ready for Verification and Approval</h6>
                </div>
                <div>
                  <i className="bi bi-x"></i>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <NotificationPage
        open={open}
        onClose={handleClose}
        onOpen={getNotificationCount}
      />
      {/* <HRNotification open={HRNotificationOpen} onClose={HRNotificationHandleClose} /> */}
      <Notificationhr
        open={HRNotificationOpen}
        onClose={HRNotificationHandleClose}
      />
    </>
  );
};

export default Header;
