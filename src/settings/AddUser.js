// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { getAllUserRoles, saveUser, editUser } from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";
import Swal from "sweetalert2";
import { uploadSingleImage } from "../services/apiService";
const AddUser = ({
  open,
  onAddUser,
  onClose,
  editMode,
  userSet,
  errors,
  setErrors,
}) => {
  const [RolesList, setRolesList] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "",
    phonenumber: "",
    emailsignature: {},
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [closePopUp, setclosePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  useEffect(() => {
    fetchrolesList();
  }, []);
  useEffect(() => {
    if (editMode && userSet) {
      console.log(userSet, "userSet");
      setFormData({
        name: userSet.name || "",
        email: userSet.email || "",
        username: userSet.username || "",
        password: "",
        role: userSet.userRole?._id || "",
        userId: userSet._id,
        phonenumber: userSet.phonenumber || "",
        emailsignature: userSet.emailSignature || {},
      });
    } else {
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "",
        phonenumber: "",
        emailsignature: {},
      });
    }
  }, [editMode, userSet]);
  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "",
        phonenumber: "",
        emailsignature: {},
      });
    }
  }, [open, setErrors]);

  useEffect(() => {
    console.log(formData, "adduser_formData");
  }, [formData]);
  const fetchrolesList = async () => {
    try {
      const listallroles = await getAllUserRoles();
      console.log(listallroles, "getAllUserRoles");
      setRolesList(listallroles?.roles || []);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };
  const fetchusersList = async () => {
    if (closePopUp == false) {
      onAddUser();
      onClose();
    }
    setOpenPopUp(false);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const [selectedRoleType, setSelectedRoleType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, "adduser handleChange_adduser");
    console.log(value, "value handleChange_adduser ");

    // If changing the role, update selectedRoleType
    if (name === "role") {
      const selectedRoleObj = RolesList.find((r) => r._id === value);
      setSelectedRoleType(selectedRoleObj?.roleType || "");
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (selectedRoleType == "operations") {
      if (!formData.phonenumber)
        newErrors.phonenumber = "Phone number is required";
    }

    if (editMode == false)
      if (!formData.password) newErrors.password = "Password is required";

    if (editMode == false)
      if (
        !formData.emailsignature ||
        !formData.emailsignature.url ||
        !formData.emailsignature.originalName
      ) {
        newErrors.emailsignature = "Email Signature is required";
      }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (editMode) {
        console.log("Edit mode formData:", formData);
        response = await editUser(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveUser(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
        setFormData({
          name: "",
          username: "",
          email: "",
          role: "",
          password: "",
          phonenumber: "",
          emailsignature: {},
        });
        onAddUser(formData);
        onClose();
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
        setclosePopup(true);
      }
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating user", error);
    }
  };

  useEffect(() => {
    console.log(RolesList, "RolesList");
    console.log(selectedRoleType, "selectedRoleType");
  }, [RolesList, selectedRoleType]);
  const documentsUpload = async (event) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const file = event.target.files?.[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG image formats are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // Use "file" if your backend expects one file

    try {
      setUploadStatus("Uploading...");
      const response = await uploadSingleImage(formData);
      console.log(response, "response_uploadSingleImage");
      if (response.status) {
        setUploadStatus("Upload successful!");
        // Also update formData.emailsignature
        setFormData((prevFormData) => ({
          ...prevFormData,
          emailsignature: response.data,
        }));
        errors.emailsignature = "";
      } else {
        setUploadStatus("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("File upload error:", error);
      setUploadStatus("An error occurred during upload.");
    }
  };

  const deleteImage = (document, index) => {
    console.log(document, "document_deleteInvoiceDocument");
    console.log(index, "index_deleteInvoiceDocument");

    // Swal.fire({
    //   title: "Are you sure?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#d33",
    //   cancelButtonColor: "#3085d6",
    //   confirmButtonText: "Yes, delete it!",
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     if (document?._id) {
    //       let pdaPayload = {
    //         pdaId: pdaResponse?._id,
    //         documentId: document?._id,
    //       };
    //       setIsLoading(true);
    //       try {
    //         const response = await deletePdaInvoiceDocument(pdaPayload);
    //         console.log(response, "login_response");
    //         if (response?.status == true) {
    //           setIsLoading(false);
    //           setMessage("File deleted successfully");
    //           setOpenPopUp(true);
    //           fetchPdaDetails();
    //         } else {
    //           setIsLoading(false);
    //           setMessage("Failed please try again");
    //           setOpenPopUp(true);
    //           fetchPdaDetails();
    //         }
    //       } catch (error) {
    //         setIsLoading(false);
    //         setMessage("Failed please try again");
    //         setOpenPopUp(true);
    //         fetchPdaDetails();
    //       } finally {
    //         setIsLoading(false);
    //       }
    //     } else if (!document?._id) {
    //       const updatedFiles = uploadedFile.filter((_, i) => i !== index);
    //       console.log(updatedFiles, "updatedFiles");
    //       setUploadedFile(updatedFiles);
    //       setMessage("File has been deleted successfully");
    //       setOpenPopUp(true);
    //     }
    //   }
    // });
  };

  return (
    <>
      <Dialog
        sx={{
          width: 800,
          margin: "auto",
          borderRadius: 2,
        }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="lg"
      >
        <div className="d-flex justify-content-between " onClick={onClose}>
          <DialogTitle>{editMode ? "Edit User" : "Add User"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="name"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.name}
                  ></input>
                  {errors.name && (
                    <span className="invalid">{errors.name}</span>
                  )}
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Username<span className="required"> * </span>:
                  </label>
                  <input
                    name="username"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.username}
                  ></input>
                  {errors.username && (
                    <span className="invalid">{errors.username}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="password_container">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    New Password<span className="required"> * </span>:
                  </label>
                  <input
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.password}
                  ></input>
                  <span className="password_icon">
                    <i
                      onClick={togglePasswordVisibility}
                      className={
                        passwordVisible ? "bi bi-eye-slash" : "bi bi-eye"
                      }
                    ></i>
                  </span>
                </div>
                {errors.password && (
                  <span className="invalid ">{errors.password}</span>
                )}
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Mail ID<span className="required"> * </span>:
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.email}
                  ></input>
                  {errors.email && (
                    <span className="invalid">{errors.email}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Role <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="role"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.role}
                    >
                      <option value="">Choose Role </option>
                      {RolesList.map((roles) => {
                        if (roles && roles.role) {
                          return (
                            <option key={roles._id} value={roles._id}>
                              {roles.role.designationName}
                            </option>
                          );
                        }
                        return null; // Return null if roles.role doesn't exist
                      })}
                    </select>
                    {errors.role && (
                      <span className="invalid">{errors.role}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Phone Number:{" "}
                    {errors.phonenumber && (
                      <span className="required"> * </span>
                    )}
                  </label>
                  <input
                    name="phonenumber"
                    type="number"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.phonenumber}
                  ></input>
                  {errors.phonenumber && (
                    <span className="invalid">{errors.phonenumber}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="row align-items-center">
              <div className="col-6">
                <label htmlFor="formFile" className="form-label">
                  Email Signature:
                </label>
                <input
                  className="form-control documentsfsize linheight"
                  type="file"
                  id="portofolio"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    documentsUpload(e); // Call your upload handler
                    e.target.value = ""; // Reset the file input value to hide uploaded file names
                  }}
                ></input>
              </div>
              <div className="col-6">
                <div className="">
                  {formData.emailsignature &&
                    formData.emailsignature.url &&
                    formData.emailsignature.originalName && (
                      <>
                        <img
                          src={`${process.env.REACT_APP_ASSET_URL}${formData.emailsignature.url}`}
                          alt={formData.emailsignature.originalName}
                          style={{
                            maxHeight: "100px",
                            objectFit: "contain",
                          }} // Adjust height as needed
                          className="img-fluid"
                        />
                      </>
                    )}
                </div>
              </div>
            </div>
            {errors.emailsignature && (
              <span className="invalid">{errors.emailsignature}</span>
            )}

            <div className="btnuser">
              <button className="btn btna submit-button btnfsize">
                {" "}
                Submit{" "}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchusersList} />}
    </>
  );
};

export default AddUser;
