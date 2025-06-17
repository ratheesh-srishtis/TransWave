// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  getBankSummaryReport,
  bankSummaryReportPDF,
} from "../../services/apiService";
import {
  saveVoucher,
  editVoucher,
  getAllQuotationIds,
  getAllBanks,
  getAllFinanceEmployees,
} from "../../services/apiPayment";
import { getAllCustomers, getAllVendors } from "../../services/apiSettings";

import "../../css/reports/banksummary.css";
const BankSummaryReport = ({ employees }) => {
  const Group = require("../../assets/images/reporttttt.png");
  console.log(employees, "employees_PettyCashReport");
  const [eta, setEta] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [reportList, setReportList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedBankId, setSelectedBankName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedvendor, setSelectedvendor] = useState("");
  const [EmployeeList, setEmployeeList] = useState([]);

  const handleEtaChange = (date) => {
    console.log(date, "datehandleEtaChange");
    if (date) {
      setEta(date);
      console.log(date, "datehandleEtaChange");
      let formatDate = date ? moment(date).format("YYYY-MM-DD ") : null;
      console.log(formatDate, "formatDate");
      setPaymentDate(formatDate);
    }
  };

  // selectedBankId, selectedCustomer, selectedvendor

  const columns = [
    { field: "bank", headerName: "Bank Name", flex: 1 },
    { field: "pettySum", headerName: "Petty Amount", flex: 1 },
    { field: "customerReceived", headerName: "Receivable Amount", flex: 1 },
    { field: "customerPaid", headerName: "Payable Amount", flex: 1 },
    { field: "bankBalanceAmount", headerName: "Balance Amount", flex: 1 },
  ];

  const NoRowsOverlay = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: "gray",
      }}
    >
      <Typography>No Report available for given terms</Typography>
    </Box>
  );

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "bank":
        console.log(value, "value_handleSelectChange");
        setSelectedBankName(value);
        break;
      case "customer":
        console.log(value, "value_handleSelectChange");
        setSelectedCustomer(value);
        break;
      case "vendor":
        console.log(value, "value_handleSelectChange");
        setSelectedvendor(value);
        break;
      case "employee":
        console.log(value, "value_handleSelectChange");
        setSelectedEmployee(value);
        break;
      default:
        break;
    }
  };

  const [filterType, setFilterType] = useState("month"); // Default to "monthly"
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  // Array of months
  const months = [
    { name: "January", value: "1" },
    { name: "February", value: "2" },
    { name: "March", value: "3" },
    { name: "April", value: "4" },
    { name: "May", value: "5" },
    { name: "June", value: "6" },
    { name: "July", value: "7" },
    { name: "August", value: "8" },
    { name: "September", value: "9" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  // Generate an array of years (e.g., 2000 to 2030)
  const startYear = 2000;
  const endYear = 2030;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    console.log(newYear, "newYear_handleYearChange");
    setSelectedYear(newYear);
  };

  const handleFilterTypeChange = (event) => {
    const newFilterType = event.target.value;
    setFilterType(newFilterType);
  };

  const getReport = async () => {
    let payload = {
      bankId: selectedBankId,
      paymentDate: paymentDate,
      customerId: selectedCustomer,
      vendorId: selectedvendor,
      pettyEmployeeId: selectedEmployee,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await getBankSummaryReport(payload);
      setReportList(response?.report);
      console.log("getBankSummaryReport", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(paymentDate, "paymentDate");
    console.log(selectedEmployee, "selectedEmployee");
    getReport();
  }, [
    paymentDate,
    selectedBankId,
    selectedCustomer,
    selectedvendor,
    selectedEmployee,
  ]);

  const fetchBanks = async () => {
    try {
      const listbanks = await getAllBanks();
      setBankList(listbanks?.bank || []);
    } catch (error) {
      console.log("Bank list Error", error);
    }
  };

  const fetchVendorList = async () => {
    try {
      let payload = { sortByName: true };
      const listallVendors = await getAllVendors(payload);
      setVendorList(listallVendors?.vendors || []);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  const fetchCustomerList = async () => {
    try {
      let payload = { sortByName: true };
      const listallUsers = await getAllCustomers(payload);
      setCustomerList(listallUsers?.customers || []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  const fetchFinaceEmployees = async () => {
    try {
      const listemployees = await getAllFinanceEmployees();
      setEmployeeList(listemployees?.employees || []);
    } catch (error) {
      console.log("Employee list Error", error);
    }
  };

  useEffect(() => {
    getReport();
    fetchBanks();
    fetchVendorList();
    fetchCustomerList();
    fetchFinaceEmployees();
  }, []);

  useEffect(() => {
    console.log(bankList, "bankList");
  }, [bankList]);

  const getPDF = async () => {
    let payload = {
      bankId: selectedBankId,
      paymentDate: paymentDate,
      customerId: selectedCustomer,
      vendorId: selectedvendor,
      pettyEmployeeId: selectedEmployee,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await bankSummaryReportPDF(payload);
      console.log("getPettyCashReport", response);

      if (response?.pdfPath) {
        const pdfUrl = `${process.env.REACT_APP_ASSET_URL}${response.pdfPath}`;
        // Fetch the PDF as a Blob
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        // Create a hidden anchor tag to trigger the download
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.setAttribute("download", "Bank Summary Report.pdf"); // Set the file name
        document.body.appendChild(link);
        link.click();
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  return (
    <>
      <div>
        <div className="mt-3 d-flex">
          <div className="jobfilter banksummarypayment">
            <label
              htmlFor="inputPassword"
              className=" form-labele col-form-label text-nowrap"
            >
              Payment Date:
            </label>
            <div className="datepickerpetty">
              <DatePicker
                dateFormat="dd/MM/yyyy"
                selected={eta ? new Date(eta) : null} // Inline date conversion for prefilled value
                onChange={handleEtaChange}
                className="form-control bansummary-datepicker"
                id="eta-picker"
                placeholderText="dd-mm-yyyy"
                autoComplete="off"
              />
            </div>
          </div>
          <div className=" d-flex banksummarybank">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labele filterbypayment "
            >
              Filter By:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselbox statusscustomerbypayment"
                aria-label="Small select example"
                name="bank"
                onChange={handleSelectChange}
                value={selectedBankId}
              >
                <option value="">Select Bank Name</option>
                {bankList?.map((bank) => (
                  <option key={bank?._id} value={bank?._id}>
                    {bank?.bankName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className=" d-flex banksummarybank">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labele filterbypayment "
            >
              Filter By:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselbox statusscustomernew"
                aria-label="Small select example"
                name="customer"
                onChange={handleSelectChange}
                value={selectedCustomer}
              >
                <option value="">Select Customer</option>
                {customerList?.map((customer) => (
                  <option key={customer?._id} value={customer?._id}>
                    {customer?.customerName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className=" d-flex banksummarybank">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labele filterbypayment "
            >
              Filter By:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselbox statusscustomername"
                aria-label="Small select example"
                name="vendor"
                onChange={handleSelectChange}
                value={selectedvendor}
              >
                <option value="">Select Vendor</option>
                {vendorList?.map((vendor) => (
                  <option key={vendor?._id} value={vendor?._id}>
                    {vendor?.vendorName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className=" d-flex banksummarybank">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labele filterbypayment "
            >
              Filter By:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselbox statusscustomername "
                aria-label="Small select example"
                name="employee"
                onChange={handleSelectChange}
                value={selectedEmployee}
              >
                <option value="">Choose Employee</option>
                {EmployeeList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {`${emp.name}_Petty`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="charge mt-3 mb-3">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div className="col-11 d-flex justify-content-end mt-2 mb-3 bankdown">
          <button
            className="btn btn-info filbtnjob"
            onClick={() => {
              getPDF();
            }}
          >
            Download PDF
          </button>
        </div>
      </div>
      <div className=" tablequo">
        <div className="quotation-outer-div">
          <div>
            <DataGrid
              rows={
                reportList?.length > 0
                  ? reportList?.map((item, index) => ({
                      id: index,
                      bank: item?.bank || "N/A", // Ensure employee is a string
                      pettySum: item.pettySum ?? "N/A",
                      customerReceived: item.customerReceived ?? "N/A",
                      customerPaid: item.vendorPaid ?? "N/A",
                      bankBalanceAmount: item.bankBalanceAmount ?? "N/A",
                    }))
                  : []
              }
              columns={columns}
              getRowId={(row) => row.id} // Use id field for unique row identification
              components={{
                NoRowsOverlay,
              }}
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#eee !important", // Set gray background color
                  color: "#000000", // Set white text color for contrast
                  fontWeight: "bold", // Optional: Make the text bold
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "& .MuiTablePagination-toolbar": {
                  alignItems: "baseline", // Apply align-items baseline
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#eee", // Gray background for the footer
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold", // Bold font for header text
                },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none", // Remove the blue focus outline
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center", // Center vertically
                  justifyContent: "left", // Center horizontally
                  textOverflow: "ellipsis",
                },
              }}
              pagination // Enables pagination
              pageSizeOptions={[5, 10, 20, 50, 100]} // Sets available page size options
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10, // Default page size
                    page: 0, // Default page index
                  },
                },
              }}
            />
          </div>
          {reportList?.length == 0 && (
            <>
              <div className="no-data">
                <p>No reports are available for the specified terms</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BankSummaryReport;
