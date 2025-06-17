// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/costcenterbreakup.css";
import {
  getCostCentreBreakupReport,
  getAllJobIds,
  costCentreBreakupReportPDF,
} from "../../services/apiService";
import { DataGrid } from "@mui/x-data-grid";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../Loader";
const CostCenterBreakup = () => {
  const Group = require("../../assets/images/reporttttt.png");
  const [reportList, setReportList] = useState([]);
  const [jobIdList, setJobIdList] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedJobNo, setSelectedJobNo] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [totalAmountOMR, setTotalAmountOMR] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [portName, setPortName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getReport = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    setIsLoading(true);
    try {
      setIsLoading(false);

      const response = await getCostCentreBreakupReport(payload);
      setInvoiceId(response?.pda?.invoiceId);
      setServices(response?.pdaServices);
      setVesselName(response?.pda?.vesselId?.vesselName);
      setPortName(response?.pda?.portId?.portName);
      console.log("getCostCentreBreakupReport", response);
    } catch (error) {
      setIsLoading(false);

      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(invoiceId, "invoiceId");
    console.log(services, "services");
  }, [invoiceId, services]);

  const getAllJobIDS = async () => {
    setIsLoading(true);
    try {
      setIsLoading(false);
      const response = await getAllJobIds();
      setJobIdList(response?.jobs);
      console.log("getPettyCashReport", response);
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to fetch quotations:", error);
    }
  };
  useEffect(() => {
    getAllJobIDS();
  }, []);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "jobNo":
        setSelectedJobNo(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log(selectedJobNo, "selectedJobNo");
    if (selectedJobNo) {
      getReport();
    }
  }, [selectedJobNo]);

  // useEffect(() => {
  //   console.log(jobIdList, "jobIdList");
  //   setSelectedJobNo(jobIdList[0]?._id);
  // }, [jobIdList]);

  const totalCustomerAmount = services.reduce(
    (sum, s) => sum + s.customerOMR + s.customerVAT,
    0
  );
  const totalVendorAmount = services.reduce(
    (sum, s) => sum + s.vendorOMR + s.vendorVAT,
    0
  );
  const profitOrLoss = String(totalCustomerAmount - totalVendorAmount);
  console.log(totalCustomerAmount, "totalCustomerAmount");
  console.log(totalCustomerAmount, "totalCustomerAmount");

  const columns = [
    {
      field: "invoiceDisplay",
      headerName: "Sales",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        if (params.value === "Total Amount") {
          return <span className="bold-label">Total Amount</span>;
        }
        return params.value || "";
      },
    },
    {
      field: "customerAmount",
      headerName: "Amount",
      flex: 1,
      sortable: false,
      renderCell: (params) =>
        params.value && !isNaN(params.value)
          ? `OMR ${Number(params.value).toFixed(3)}`
          : "",
    },
    {
      field: "vendorName",
      headerName: "Purchase",
      flex: 1,
      sortable: false,
      renderCell: (params) =>
        params.value === "Total Amount" ? (
          <span className="bold-label">{params.value}</span>
        ) : (
          params.value
        ),
    },
    {
      field: "vendorAmount",
      headerName: "Amount",
      flex: 1,
      sortable: false,
      renderCell: (params) =>
        params.value && !isNaN(params.value) ? (
          <span
            style={{
              color:
                params.row.vendorName === "Profit"
                  ? "green"
                  : params.row.isLoss
                  ? "red"
                  : "inherit",
              fontWeight:
                params.row.vendorName === "Profit" ||
                params.row.vendorName === "Loss"
                  ? "bold"
                  : "normal",
            }}
          >
            OMR {Number(params.value).toFixed(3)}
          </span>
        ) : (
          ""
        ),
    },
  ];

  // Add footer rows dynamically
  const rows = services.map((service, index) => ({
    id: service._id || index,
    invoiceDisplay: index === 0 ? `Invoice No : ${invoiceId}` : "", // Only show invoiceId in first row
    customerAmount: service.customerOMR + service.customerVAT,
    vendorName: service?.vendorId?.vendorName ?? null,
    vendorAmount: service.vendorOMR + service.vendorVAT,
  }));

  rows.push(
    {
      id: "TotalCustomerVendorAmount",
      invoiceDisplay: "Total Amount",
      customerAmount: totalCustomerAmount,
      vendorName: "Total Amount",
      vendorAmount: totalVendorAmount,
      isFooter: true,
    },
    {
      id: "ProfitOrLoss",
      invoiceDisplay: "",
      customerAmount: "",
      vendorName: profitOrLoss >= 0 ? "Profit" : "Loss",
      vendorAmount: profitOrLoss,
      isFooter: true,
      isLoss: profitOrLoss < 0,
    }
  );

  const getPDF = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await costCentreBreakupReportPDF(payload);
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
        link.setAttribute("download", "Cost Centre Breakup Report.pdf"); // Set the file name
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
      <div className="p-2">
        <div className="d-flex mt-3">
          <div className="d-flex align-items-center">
            <div className="col-">
              <label htmlFor="input" className="col-form-label costcenterinput">
                Job No:
              </label>
            </div>
            <div className="col-8">
              <select
                className="form-select vesselboxcostcenter statusscustomer"
                aria-label="Small select example"
                name="jobNo"
                onChange={handleSelectChange}
                value={selectedJobNo}
              >
                <option value="">Select Job No.</option>
                {jobIdList?.map((job) => (
                  <option key={job?._id} value={job?._id}>
                    {job?.jobId}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {vesselName && (
            <>
              <div className="d-flex align-items-center pettymargin">
                <div className="col-5">
                  <label
                    htmlFor="input"
                    className="col-form-label costcenterinput"
                  >
                    Vessel Name:
                  </label>
                </div>
                <div className="col-8">
                  <input
                    type="text"
                    id="inputPassword6"
                    className="form-control costcenterfontsize"
                    placeholder=""
                    readOnly
                    value={vesselName}
                  ></input>
                </div>
              </div>
            </>
          )}
          {portName && (
            <>
              <>
                <div className="d-flex align-items-center margincostcenter">
                  <div className="col-">
                    <label
                      htmlFor="input"
                      className="col-form-label costcenterport"
                    >
                      Port Name:
                    </label>
                  </div>
                  <div className="col-8">
                    <input
                      type="text"
                      id="inputPassword6"
                      className="form-control costcenterportname"
                      placeholder=""
                      readOnly
                      value={portName}
                    ></input>
                  </div>
                </div>
              </>
              <>
                <div className="col-1">
                  <button
                    className="btn btn-info filbtnjob"
                    onClick={() => {
                      getPDF();
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              </>
            </>
          )}
        </div>
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        {/* {selectedJobNo && (
          <>
            <div className=" p-3">
              <table className="table tablepay">
                <thead className="">
                  <tr className="createtable">
                    <th className=" paytexthead marginpay">SALES </th>
                    <th className="paytexthead marginpay ">AMOUNT</th>
                    <th className="paytexthead marginpay">PURCHASE</th>
                    <th className="paytexthead marginpay ">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service._id}>
                      <td className="paytexthead marginpay">
                        {index === 0 ? invoiceId : ""}
                      </td>
                      <td className="paytexthead marginpay">
                        OMR{" "}
                        {(service.customerOMR + service.customerVAT).toFixed(2)}
                      </td>
                      <td className="paytexthead marginpay">
                        {service.vendorId.vendorName}
                      </td>
                      <td className="paytexthead marginpay">
                        OMR {(service.vendorOMR + service.vendorVAT).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bold-row">
                    <td className="paytexthead marginpay resultpay">
                      Total Customer Amount
                    </td>
                    <td className="paytexthead marginpay resultpay">
                      OMR{" "}
                      {services
                        .reduce(
                          (sum, s) => sum + s.customerOMR + s.customerVAT,
                          0
                        )
                        .toFixed(2)}
                    </td>
                    <td className="paytexthead marginpay resultpay">
                      Total Vendor Amount
                    </td>
                    <td className="paytexthead marginpay resultpay">
                      OMR{" "}
                      {services
                        .reduce((sum, s) => sum + s.vendorOMR + s.vendorVAT, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bold-row">
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                    <td
                      className={`paytexthead marginpay resultpay ${
                        profitOrLoss >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {profitOrLoss >= 0 ? "Profit" : "Loss"}
                    </td>
                    <td
                      className={`paytexthead marginpay resultpay ${
                        profitOrLoss >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      OMR {profitOrLoss.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )} */}
        {selectedJobNo && (
          <>
            <DataGrid
              rows={rows}
              columns={columns}
              hideFooter={false} // Ensure footer is visible
              pagination
              paginationMode="client" // Enable client-side pagination
              autoPageSize={false} // Prevents automatic page size
              pageSizeOptions={[5, 10, 20, 50, 100]} // Defines available page sizes
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10, // Default page size
                    page: 0, // Default page index
                  },
                },
              }}
              getRowClassName={(params) => {
                console.log(params, "paramscvcv");
                // if (params.row.isFooter) return "footer-row"; // Apply class for footer
                if (params?.row?.vendorName === "Loss") return "loss-row"; // Apply class for loss row
                if (params?.row?.vendorName === "Profit") return "profit-row"; // Apply class for profit row
                return "";
              }}
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#eee !important", // Header background color
                  color: "#000 !important", // Header text color
                  fontWeight: "bold !important",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#eee !important", // Footer background matches header
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold !important",
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                },
                // Footer Row Styling
                "& .footer-row .MuiDataGrid-cell": {
                  fontWeight: "bold !important", // Make footer text bold
                  color: "#000 !important", // Ensure text is black
                },
                // Profit Row Styling (Green)
                "& .profit-row .MuiDataGrid-cell": {
                  color: "green !important",
                  fontWeight: "bold !important",
                },
                // Loss Row Styling (Red)
                "& .loss-row .MuiDataGrid-cell": {
                  color: "red !important",
                  fontWeight: "bold !important",
                },
                // ✅ Apply bold style **only** to "Total Customer Amount" & "Total Vendor Amount"
                "& .bold-label": {
                  color: "#000 !important",
                  fontWeight: "bold !important",
                  fontSize: "14px !important",
                },
                "& .MuiTablePagination-toolbar": {
                  alignItems: "baseline", // Apply align-items baseline
                },
              }}
            />
          </>
        )}

        {!selectedJobNo && (
          <>
            <p>Please select a job first</p>
          </>
        )}
      </div>
      <Loader isLoading={isLoading} />
    </>
  );
};

export default CostCenterBreakup;
