import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { loginResponse } = useAuth();
  const location = useLocation(); // Get the current location object

  const { logout } = useAuth();

  console.log(loginResponse, "loginResponse_sidebar");

  const Logo = require("../assets/images/LOGO.png");

  const [lastPath, setLastPath] = useState("");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    console.log(path, "current_path");
    const lastSegment = path.substring(path.lastIndexOf("/") + 1);
    setLastPath(lastSegment);
  }, []);

  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [menuList, setMenuList] = useState([]);
  const userPermissions = loginResponse?.permission || [];
  const userSettingsPermissions = loginResponse?.submenuPermission || [];
  const menuArr = [
    "dashboard",
    "quotations",
    "jobs",
    "payments",
    "soa",
    "employee",
    "leave reports",
    "report",
    "General Documents",
  ];
  const handleNavigation = (menuItem) => {
    console.log(menuItem, "menuItem");
    if (menuArr.includes(menuItem)) {
      setShowSubmenu(false);
      setActiveSubMenu("");
    } else {
      setShowSubmenu((prev) => !prev);
      if (menuItem != "settings") setActiveSubMenu(menuItem);
    }
    if (lastPath == menuItem) {
      setActiveMenu(lastPath);
    } else if (lastPath != menuItem) {
      setActiveMenu(menuItem);
    }
    setActiveMenu(menuItem); // Update the active menu item
    console.log(menuItem, "handleNavigation");

    switch (menuItem) {
      case "dashboard":
        navigate("/dashboard"); // Replace with your actual route
        break;
      case "quotations":
        navigate("/quotations"); // Replace with your actual route
        break;
      case "reports":
        navigate("/reports"); // Replace with your actual route
        break;
      case "jobs":
        navigate("/jobs"); // Replace with your actual route
        break;
      case "payments":
        navigate("/payments");
        break;
      case "soa":
        navigate("/soa");
        break;
      case "employee":
        navigate("/employee");
        break;
      case "leave reports":
        navigate("/leavereports");
        break;
      case "roles-settings":
        navigate("/roles-settings");
        break;
      case "user-settings":
        navigate("/user-settings");
        break;
      case "vessels-settings":
        navigate("/vessels-settings");
        break;
      case "vessel-type-settings":
        navigate("/vessel-type-settings");
        break;
      case "ports-settings":
        navigate("/ports-settings");
        break;
      case "customer-settings":
        navigate("/customer-settings");
        break;
      case "service-settings":
        navigate("/service-settings");
        break;
      case "charges-settings":
        navigate("/charges-settings");
        break;
      case "sub-charges-settings":
        navigate("/sub-charges-settings");
        break;
      case "cargo-settings":
        navigate("/cargo-settings");
        break;
      case "anchorage-locations":
        navigate("/anchorage-locations");
        break;
      case "vendor-settings":
        navigate("/vendor-settings");
        break;
      case "QQform-settings":
        navigate("/QQform-settings");
        break;
      case "Bank-settings":
        navigate("/Bank-settings");
        break;
      case "password-requests":
        navigate("/password-requests");
        break;
      case "report":
        navigate("/reports");
        break;
      case "General Documents":
        navigate("/general-documents");
        break;
      case "anchorage-stay-charges":
        navigate("/anchorage-stay-charges");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setMenuList(loginResponse?.data?.userRole?.permissions);
  }, [loginResponse]);

  useEffect(() => {
    const path = location.pathname; // Get the current path
    const pathSegments = path.split("/"); // Split the path into segments
    const finalPart = pathSegments[pathSegments.length - 1]; // Get the last segment
    const formattedPath = `/${finalPart}`; // Add a leading slash
    setCurrentPath(formattedPath);
    console.log(formattedPath, "formatted_path"); // Output: /jobs

    if (formattedPath == "/chats") {
      setActiveMenu("");
    }
  }, [location.pathname]); // Run effect whenever path changes

  useEffect(() => {
    if (lastPath) {
      setActiveMenu(lastPath);
    }
  }, [lastPath]);

  useEffect(() => {
    console.log(menuList, "menuList");
    console.log(activeMenu, "activeMenu");
  }, [activeMenu]);

  // Define menu items with icons and paths
  const menuItems = {
    dashboard: { label: "Dashboard", icon: "bi bi-pie-chart" },
    quotations: { label: "Quotations", icon: "bi bi-receipt-cutoff" },
    jobs: { label: "Jobs", icon: "bi bi-briefcase" },
    payments: { label: "Payments", icon: "bi bi-cash-stack" },
    soa: { label: "SOA", icon: "bi bi-wallet" },
    settings: { label: "Settings", icon: "bi bi-gear" },
    employee: { label: "Employee", icon: "bi bi-people" },
    "leave reports": { label: "Leave Reports", icon: "bi bi-person-slash" },
    report: { label: "Reports", icon: "bi bi-bar-chart" },
    "General Documents": {
      label: "General Documents",
      icon: "bi bi-bar-chart",
    },
  };

  useEffect(() => {
    console.log(userPermissions, "userPermissions");
    if (userPermissions.length > 0) {
      setActiveMenu(userPermissions[0]); // Set the first permissible menu item as active
    }
  }, [userPermissions]);
  useEffect(() => {
    console.log(userSettingsPermissions, "userSettingsPermissions");
  }, [userSettingsPermissions]);

  return (
    <>
      <div className="mainbody">
        <div className="sidebar">
          <div className="space">
            <ul className="menu">
              <img className="side-logo" src={Logo} alt="Logo" />
              {/* Render each item only if it's in the user permissions */}

              {userPermissions.map(
                (perm) =>
                  menuItems[perm] && (
                    <li
                      key={perm}
                      onClick={() => handleNavigation(perm)}
                      className={
                        activeMenu === perm
                          ? "active menulist menugap"
                          : "menugap"
                      }
                    >
                      <a>
                        <i
                          className={`${menuItems[perm].icon} ${
                            activeMenu === perm ? "active-span menulist" : ""
                          }`}
                        ></i>

                        <span
                          className={
                            activeMenu === perm
                              ? "active-span menulist "
                              : "menulist"
                          }
                        >
                          {" "}
                          {menuItems[perm].label}
                        </span>
                      </a>
                      {/* Show submenu for settings */}
                      {/* {perm === "settings" && showSubmenu && (
                        <div className="submenu">
                          <ul className="settingsmenu">
                            <li
                              className={
                                activeSubMenu === "roles-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() => handleNavigation("roles-settings")}
                            >
                              Roles
                            </li>
                            <li
                              className={
                                activeSubMenu === "user-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() => handleNavigation("user-settings")}
                            >
                              User
                            </li>
                            <li
                              className={
                                activeSubMenu === "vessels-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("vessels-settings")
                              }
                            >
                              Vessels
                            </li>
                            <li
                              className={
                                activeSubMenu === "vessel-type-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("vessel-type-settings")
                              }
                            >
                              Vessel Types
                            </li>
                            <li
                              className={
                                activeSubMenu === "ports-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() => handleNavigation("ports-settings")}
                            >
                              Ports
                            </li>

                            <li
                              className={
                                activeSubMenu === "customer-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("customer-settings")
                              }
                            >
                              Customers
                            </li>
                            <li
                              className={
                                activeSubMenu === "service-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("service-settings")
                              }
                            >
                              Services
                            </li>
                            <li
                              className={
                                activeSubMenu === "charges-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("charges-settings")
                              }
                            >
                              Charges
                            </li>
                            <li
                              className={
                                activeSubMenu === "sub-charges-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("sub-charges-settings")
                              }
                            >
                              Sub Charges
                            </li>
                            <li
                              className={
                                activeSubMenu === "cargo-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() => handleNavigation("cargo-settings")}
                            >
                              Cargoes
                            </li>
                            <li
                              className={
                                activeSubMenu === "anchorage-locations"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("anchorage-locations")
                              }
                            >
                              Anchorage Locations
                            </li>
                            <li
                              className={
                                activeSubMenu === "vendor-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("vendor-settings")
                              }
                            >
                              Vendors
                            </li>
                            <li
                              className={
                                activeSubMenu === "QQform-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("QQform-settings")
                              }
                            >
                              QQ Form
                            </li>
                            <li
                              className={
                                activeSubMenu === "Bank-settings"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() => handleNavigation("Bank-settings")}
                            >
                              Banks
                            </li>
                            <li
                              className={
                                activeSubMenu === "password-requests"
                                  ? "menusubactive"
                                  : "menusub"
                              }
                              onClick={() =>
                                handleNavigation("password-requests")
                              }
                            >
                              Password Reset Request
                            </li>
                          </ul>
                        </div>
                      )} */}
                      {perm === "settings" && showSubmenu && (
                        <>
                          <div className="submenu">
                            <ul className="settingsmenu">
                              {userSettingsPermissions.map((item) => {
                                const submenuMap = {
                                  User: "user-settings",
                                  Vessels: "vessels-settings",
                                  "Vessel Types": "vessel-type-settings",
                                  Ports: "ports-settings",
                                  Roles: "roles-settings",
                                  Customers: "customer-settings",
                                  Services: "service-settings",
                                  Charges: "charges-settings",
                                  "Sub Charges": "sub-charges-settings",
                                  Cargoes: "cargo-settings",
                                  "Anchorage Locations": "anchorage-locations",
                                  Vendors: "vendor-settings",
                                  "QQ Form": "QQform-settings",
                                  Banks: "Bank-settings",
                                  "Password Reset Request": "password-requests",
                                  "Anchorage Stay Charges":
                                    "anchorage-stay-charges",
                                };
                                const submenuKey = submenuMap[item.submenu];
                                // Skip if it's not a known submenu
                                if (!submenuKey) return null;

                                return (
                                  <li
                                    key={item.submenuId}
                                    className={
                                      activeSubMenu === submenuKey
                                        ? "menusubactive"
                                        : "menusub"
                                    }
                                    onClick={() => handleNavigation(submenuKey)}
                                  >
                                    {item.submenu}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </>
                      )}
                    </li>
                  )
              )}

              {/* Signout */}
              {/* <li className="Signout" onClick={logout}>
                <a>
                  <i className="bi bi-box-arrow-left"></i>
                  <span> Signout</span>
                </a>
              </li> */}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
