import React, { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { getCharges, getSubcharges } from "../../services/apiService";
import PopUp from "../PopUp";
import AddJobs from "./AddJobs";
import "../../css/addjobs.css";
import { useAuth } from "../../context/AuthContext";
const OpsChargesTable = ({
  chargesArray,
  services,
  ports,
  customers,
  onEdit,
  pdaResponse,
  onSubmit,
  templates,
  vendors,
  opsPhoneNumber,
}) => {
  const { loginResponse } = useAuth();

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCharge, setSelectedCharge] = useState(null); // State to hold the selected charge

  console.log(chargesArray, "chargesArray ChargesTable");

  const totalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity);
      totals.customerOMR += parseFloat(charge.customerOMR);
      totals.customerVAT += parseFloat(charge.customerVAT);
      totals.customerTotalUSD += parseFloat(charge.customerTotalUSD);
      return totals;
    },
    { quantity: 0, customerOMR: 0, customerVAT: 0, customerTotalUSD: 0 }
  );

  console.log(totalValues, "totalValues");

  const vendorTotalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity);
      totals.vendorOMR += parseFloat(charge.vendorOMR);
      totals.vendorVAT += parseFloat(charge.vendorVAT);
      totals.vendorTotalUSD += parseFloat(charge.vendorTotalUSD);
      return totals;
    },
    { quantity: 0, vendorOMR: 0, vendorVAT: 0, vendorTotalUSD: 0 }
  );

  console.log(vendorTotalValues, "vendorTotalValues");

  const handleRowClick = (charge) => {
    console.log(charge);
  };

  // Function to handle edit action
  const handleEdit = (charge, index) => {
    console.log("Edit:", charge);
    onEdit(charge, index);
    // Implement your edit logic here
  };

  const [valueTabs, setValueTabs] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValueTabs(newValue);
  };

  const [open, setOpen] = useState(false);

  const openDialog = (charge) => {
    setSelectedCharge(charge); // Set the selected charge
    handleClickOpen();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // setSelectedCharge(null); // Clear the selected charge
    // onSubmit();
  };
  const handleSubmit = () => {
    setOpen(false);
    setSelectedCharge(null); // Clear the selected charge
    onSubmit();
  };

  useEffect(() => {
    console.log(selectedCharge, "selectedCharge");
  }, [selectedCharge]);

  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const getVendorName = (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    return vendor?.vendorName || "N/A";
  };

  return (
    <>
      <div className="createtable">
        <table className="table tableheadcolor">
          <thead className="tableheadcolor">
            <tr className="tableheadcolor">
              <th className="tableheadcolor">SL NO</th>
              <th className="tableheadcolor">Service Type</th>
              <th className="tableheadcolor">Charge Type</th>
              <th className="tableheadcolor">Sub Charge Type</th>
              <th className="tableheadcolor">Vendor Name</th>
              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                "operations" && (
                <>
                  <th className="tableheadcolor">Amount (OMR)</th>
                  <th className="tableheadcolor">VAT Amount</th>
                  <th className="tableheadcolor">Total OMR</th>
                  <th className="tableheadcolor">Total USD</th>
                </>
              )}
              {/* <th className="tableheadcolor">Remarks</th> */}
              <th className="tableheadcolor">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargesArray?.length > 0 &&
              chargesArray.map((charge, index) => (
                <tr key={index} onClick={() => handleRowClick(charge)}>
                  {/* className="addjob-click" */}
                  <td>{index + 1}</td>
                  <td> {charge?.serviceId?.serviceName}</td>
                  <td> {charge.chargeId?.chargeName}</td>
                  <td>{charge.subchargeId?.subchargeName}</td>
                  <td>
                    {charge?.isPrivateVendor == false && (
                      <>{getVendorName(charge.vendorId)}</>
                    )}
                  </td>
                  {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                    "operations" && (
                    <>
                      <td>{charge.customerOMR.toFixed(3)}</td>
                      <td>{charge.customerVAT.toFixed(3)}</td>
                      <td>
                        {(
                          parseFloat(charge.customerOMR) +
                          parseFloat(charge.customerVAT)
                        ).toFixed(3)}
                      </td>
                      <td>{charge.customerTotalUSD.toFixed(2)}</td>
                    </>
                  )}

                  {/* <td className="subsub">{charge.remark}</td> */}

                  <td>
                    <i
                      className="bi bi-pencil-square editicon"
                      onClick={() => {
                        openDialog(charge);
                      }}
                    >
                      {" "}
                    </i>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AddJobs
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        templates={templates}
        charge={selectedCharge}
        services={services}
        ports={ports}
        customers={customers}
        vendors={vendors}
        pdaResponse={pdaResponse}
        opsPhoneNumber={opsPhoneNumber}
      />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default OpsChargesTable;
