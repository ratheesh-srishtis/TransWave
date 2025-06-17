import React, { useEffect, useState } from "react";
import { changeServiceOrder } from "../services/apiService";
import Swal from "sweetalert2";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import {
  deleteQuotationCharge,
  getPdaInformations,
} from "../services/apiService";
import PopUp from "./PopUp";
import { useAuth } from "../context/AuthContext";
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ChargesTable = ({
  services,
  ports,
  customers,
  onEdit,
  pdaResponse,
  onSubmit,
  vendors,
  isAction,
  from,
  chargesArray,
}) => {
  const { loginResponse } = useAuth();
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const [fetchedCharges, setFetchedCharges] = useState(new Set());
  const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");

  const totalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity || 0, 10); // Default to 0 if null/undefined
      totals.customerOMR += parseFloat(charge.customerOMR || 0);
      totals.customerVAT += parseFloat(charge.customerVAT || 0);
      totals.customerTotalUSD += parseFloat(charge.customerTotalUSD || 0);
      return totals;
    },
    { quantity: 0, customerOMR: 0, customerVAT: 0, customerTotalUSD: 0 }
  );

  const formattedTotals = {
    quantity: totalValues?.quantity,
    customerOMR: totalValues?.customerOMR.toFixed(3),
    customerVAT: totalValues?.customerVAT.toFixed(3),
    customerTotalUSD: totalValues?.customerTotalUSD.toFixed(2),
  };

  const vendorTotalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge?.quantity || 0, 10); // Default to 0 if null/undefined
      totals.vendorOMR += parseFloat(charge?.vendorOMR || 0);
      totals.vendorVAT += parseFloat(charge?.vendorVAT || 0);
      totals.vendorTotalUSD += parseFloat(charge?.vendorTotalUSD || 0);
      return totals;
    },
    { quantity: 0, vendorOMR: 0, vendorVAT: 0, vendorTotalUSD: 0 }
  );

  // Format totals after calculations
  const formattedVendorTotals = {
    quantity: vendorTotalValues?.quantity,
    vendorOMR: vendorTotalValues?.vendorOMR.toFixed(3),
    vendorVAT: vendorTotalValues?.vendorVAT.toFixed(3),
    vendorTotalUSD: vendorTotalValues?.vendorTotalUSD.toFixed(2),
  };

  // Function to handle edit action
  const handleEdit = (charge, index) => {
    console.log("Edit:", charge);
    onEdit(charge, index);
    // Implement your edit logic here
  };

  const handleDelete = async (charge, index) => {
    console.log(charge, "charge handleDelete");
    console.log(index, "index handleDelete");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("Delete:", charge);
        // Implement your delete logic here (e.g., API call to delete the charge)
        if (charge?._id) {
          try {
            let chargesPayload = {
              pdaChargeId: charge?._id,
            };
            const response = await deleteQuotationCharge(chargesPayload);
            console.log("Fetched Charges:", response);
            const updatedChargesArray = chargesArray.filter(
              (_, i) => i !== index
            );
            onSubmit(updatedChargesArray);
            setMessage("Charge deleted successfully");
            setOpenPopUp(true);
          } catch (error) {
            console.error("Error fetching charges:", error);
            Swal.fire("Error deleting charges");
          }
        } else {
          const updatedChargesArray = chargesArray.filter(
            (_, i) => i !== index
          );
          onSubmit(updatedChargesArray);
          setMessage("Charge deleted successfully");
          setOpenPopUp(true);
        }
      }
    });
  };
  const [valueTabs, setValueTabs] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValueTabs(newValue);
  };

  const handleDragEnd = async (e) => {
    if (!e.destination) return;

    const sourceIndex = e.source.index;
    const destIndex = e.destination.index;

    const tempData = Array.from(chargesArray);
    const [movedItem] = tempData.splice(sourceIndex, 1);
    tempData.splice(destIndex, 0, movedItem);

    // Update the UI
    // setChargesArray(tempData);
    console.log(tempData, "tempData");
    onSubmit(tempData);

    // Call API only for rows whose order has changed
    const changedItems = tempData.filter(
      (item, index) => chargesArray[index]?._id !== item._id
    );

    for (let index = 0; index < changedItems.length; index++) {
      const item = changedItems[index];
      const newIndex = tempData.findIndex((i) => i._id === item._id);

      if (item._id) {
        const payload = {
          pdaChargeId: item._id,
          order: newIndex + 1, // because backend uses 1-based index
        };

        console.log("API_Payload:", payload);

        // Replace with your actual API call
        const response = await changeServiceOrder(payload);
        console.log(response, "changeServiceOrder");
      }
    }
  };

  useEffect(() => {
    console.log(chargesArray, "chargesArray_chargeTable");
  }, [chargesArray]);

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={valueTabs}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Customer Charges"
              {...a11yProps(0)}
              style={{ textTransform: "capitalize" }}
            />
            <Tab
              label="Vendor Charges"
              {...a11yProps(1)}
              style={{ textTransform: "capitalize" }}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={valueTabs} index={0}>
          <div className="createtable">
            {/* <table className="table tableheadcolor">
              <thead className="tableheadcolor">
                <tr className="tableheadcolor">
                  <th className="tableheadcolor">SL NO</th>
                  <th className="tableheadcolor">Service Type</th>
                  <th className="tableheadcolor">Charge Type</th>
                  <th className="tableheadcolor">Sub Charge Type</th>
                  {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                    "operations" && (
                    <>
                      <th className="tableheadcolor">Amount (OMR)</th>
                      <th className="tableheadcolor">VAT Amount</th>
                      <th className="tableheadcolor">Total OMR</th>
                      <th className="tableheadcolor">Total USD</th>
                    </>
                  )}

                  {isAction == true && (
                    <>
                      <th className="tableheadcolor">Actions</th>{" "}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {chargesArray?.length > 0 &&
                  chargesArray.map((charge, index) => (
                    <tr key={index} onClick={() => handleRowClick(charge)}>
                      <td>{index + 1}</td>
                      <td>
                        {charge.serviceId
                          ? getItemName(charge.serviceId, "service")
                          : ""}
                      </td>
                      <td>
                        {charge.chargeId
                          ? getItemName(charge.chargeId, "chargeType")
                          : ""}
                      </td>
                      <td className="subsub">
                        {charge.subchargeId
                          ? getItemName(charge.subchargeId, "subChargeType")
                          : ""}
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

                      {isAction == true && (
                        <>
                          <td>
                            <i
                              className="bi bi-pencil-square editicon"
                              onClick={() => handleEdit(charge, index)}
                            >
                              {" "}
                            </i>
                            {pdaResponse?.pdaStatus != 7 && (
                              <>
                                <i
                                  className="bi bi-trash deleteicon"
                                  onClick={() => handleDelete(charge, index)}
                                ></i>
                              </>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>

              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                "operations" && (
                <>
                  {chargesArray?.length > 0 && (
                    <>
                      <tfoot>
                        <tr className="bold-row">
                          <td colSpan={4}>Total Cost</td>
                          <td>{formattedTotals.customerOMR}</td>
                          <td>{formattedTotals.customerVAT}</td>
                          <td>
                            {(
                              parseFloat(formattedTotals.customerOMR) +
                              parseFloat(formattedTotals.customerVAT)
                            ).toFixed(3)}
                          </td>
                          <td>{formattedTotals.customerTotalUSD}</td>
                          {isAction == true && (
                            <>
                              <td></td>
                            </>
                          )}
                        </tr>
                      </tfoot>
                    </>
                  )}
                </>
              )}
            </table> */}

            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="table tableheadcolor">
                <thead className="tableheadcolor">
                  <tr className="tableheadcolor">
                    {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                      "operations" && (
                      <>
                        <th className="tableheadcolor" />
                      </>
                    )}

                    <th  className={
    loginResponse?.data?.userRole?.roleType?.toLowerCase() == "operations"
      ? "opstablewidth"
      : "tableheadcolor"
  }  >Service Type</th>
                    <th  className={
    loginResponse?.data?.userRole?.roleType?.toLowerCase() == "operations"
      ? "opstablewidth"
      : "tableheadcolor"
  }  >Charge Type</th>
                    <th  className={
    loginResponse?.data?.userRole?.roleType?.toLowerCase() == "operations"
      ? "opstablewidth"
      : "tableheadcolor"
  }  >Sub Charge Type</th>
                    {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                      "operations" && (
                      <>
                        <th className="tableheadcolor">Amount (OMR)</th>
                        <th className="tableheadcolor">VAT Amount</th>
                        <th className="tableheadcolor">Total OMR</th>
                        <th className="tableheadcolor">Total USD</th>
                      </>
                    )}
                    {isAction == true && (
                      <>
                        <th className="tableheadcolor">Actions</th>{" "}
                      </>
                    )}
                  </tr>
                </thead>
                <Droppable droppableId="droppable-1">
                  {(provider) => (
                    <tbody
                      className="text-capitalize"
                      ref={provider.innerRef}
                      {...provider.droppableProps}
                    >
                      {chargesArray?.map((charge, index) => (
                        <Draggable
                          key={charge?._id ? charge?._id : charge?.uniqueId}
                          draggableId={
                            charge?._id ? charge?._id : charge?.uniqueId
                          }
                          index={index}
                        >
                          {(provider) => (
                            <tr
                              {...provider.draggableProps}
                              ref={provider.innerRef}
                            >
                              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                                "operations" && (
                                <>
                                  <td {...provider.dragHandleProps}>=</td>
                                </>
                              )}

                              <td>
                                {charge?.serviceId?.serviceName
                                  ? charge?.serviceId?.serviceName
                                  : charge?.serviceName}
                              </td>
                              <td>
                                {charge.chargeId?.chargeName
                                  ? charge.chargeId?.chargeName
                                  : charge.chargeName}
                              </td>
                              <td>
                                {charge.subchargeId?.subchargeName
                                  ? charge.subchargeId?.subchargeName
                                  : charge?.subchargeName}
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

                              {isAction == true && (
                                <>
                                  <td>
                                    {/* Edit and Delete Buttons */}

                                    <i
                                      className="bi bi-pencil-square editicon"
                                      onClick={() => handleEdit(charge, index)}
                                    >
                                      {" "}
                                    </i>
                                    {pdaResponse?.pdaStatus != 7 && (
                                      <>
                                        <i
                                          className="bi bi-trash deleteicon"
                                          onClick={() =>
                                            handleDelete(charge, index)
                                          }
                                        ></i>
                                      </>
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provider.placeholder}
                    </tbody>
                  )}
                </Droppable>
                {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                  "operations" && (
                  <>
                    {chargesArray?.length > 0 && (
                      <>
                        <tfoot>
                          <tr className="bold-row">
                            <td colSpan={4}>Total Cost</td>
                            {/* Use formatted totals */}
                            <td>{formattedTotals.customerOMR}</td>
                            <td>{formattedTotals.customerVAT}</td>
                            <td>
                              {(
                                parseFloat(formattedTotals.customerOMR) +
                                parseFloat(formattedTotals.customerVAT)
                              ).toFixed(3)}
                            </td>
                            <td>{formattedTotals.customerTotalUSD}</td>
                            {isAction == true && (
                              <>
                                <td></td> {/* Empty cell for footer */}
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </>
                    )}
                  </>
                )}
              </table>
            </DragDropContext>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={valueTabs} index={1}>
          <div className="createtable">
            {/* <table className="table tableheadcolor ">
              <thead className="tableheadcolor">
                <tr className="tableheadcolor">
                  <th className="tableheadcolor">SL NO</th>
                  <th className="tableheadcolor">Service Type</th>
                  <th className="tableheadcolor">Charge Type</th>
                  <th className="tableheadcolor">Sub Charge Type</th>
                  {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                    "operations" && (
                    <>
                      <th className="tableheadcolor">Amount (OMR)</th>
                      <th className="tableheadcolor">VAT Amount</th>
                      <th className="tableheadcolor">Total OMR</th>
                      <th className="tableheadcolor">Total USD</th>
                    </>
                  )}

                  {isAction == true && (
                    <>
                      <th className="tableheadcolor">Actions</th>{" "}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {chargesArray?.length > 0 &&
                  chargesArray.map((charge, index) => (
                    <tr key={index} onClick={() => handleRowClick(charge)}>
                      <td>{index + 1}</td>
                      <td>
                        {charge.serviceId
                          ? getItemName(charge.serviceId, "service")
                          : ""}
                      </td>
                      <td>
                        {charge.chargeId
                          ? getItemName(charge.chargeId, "chargeType")
                          : ""}
                      </td>
                      <td className="subsub">
                        {charge.subchargeId
                          ? getItemName(charge.subchargeId, "subChargeType")
                          : ""}
                      </td>
                      {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                        "operations" && (
                        <>
                          <td>{charge.vendorOMR.toFixed(3)}</td>
                          <td>{charge.vendorVAT.toFixed(3)}</td>
                          <td>
                            {(
                              parseFloat(charge.vendorOMR) +
                              parseFloat(charge.vendorVAT)
                            ).toFixed(3)}
                          </td>
                          <td>{charge.vendorTotalUSD.toFixed(2)}</td>
                        </>
                      )}

                      {isAction == true && (
                        <>
                          <td>
                            <i
                              className="bi bi-pencil-square editicon"
                              onClick={() => handleEdit(charge, index)}
                            >
                              {" "}
                            </i>
                            {pdaResponse?.pdaStatus != 7 && (
                              <>
                                <i
                                  className="bi bi-trash deleteicon"
                                  onClick={() => handleDelete(charge, index)}
                                ></i>
                              </>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
             
              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                "operations" && (
                <>
                  {chargesArray?.length > 0 && (
                    <>
                      <tfoot>
                        <tr className="bold-row">
                          <td colSpan={4}>Total Cost</td>
                    
                          <td>{formattedVendorTotals.vendorOMR}</td>
                          <td>{formattedVendorTotals.vendorVAT}</td>
                          <td>
                            {(
                              parseFloat(formattedVendorTotals.vendorOMR) +
                              parseFloat(formattedVendorTotals.vendorVAT)
                            ).toFixed(3)}
                          </td>
                          <td>{formattedVendorTotals.vendorTotalUSD}</td>
                          {isAction == true && (
                            <>
                              <td></td> 
                            </>
                          )}
                        </tr>
                      </tfoot>
                    </>
                  )}
                </>
              )}
            </table> */}

            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="table tableheadcolor">
                <thead className="tableheadcolor">
                  <tr className="tableheadcolor">
                    {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                      "operations" && (
                      <>
                        <th className="tableheadcolor" />
                      </>
                    )}
                    <th  className={
    loginResponse?.data?.userRole?.roleType?.toLowerCase() == "operations"
      ? "opstablewidth"
      : "tableheadcolor"
  }  >Service Type</th>
                    <th  className={
    loginResponse?.data?.userRole?.roleType?.toLowerCase() == "operations"
      ? "opstablewidth"
      : "tableheadcolor"
  }  >Charge Type</th>
                    <th  className={
    loginResponse?.data?.userRole?.roleType?.toLowerCase() == "operations"
      ? "opstablewidth"
      : "tableheadcolor"
  }  >Sub Charge Type</th>
                    {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                      "operations" && (
                      <>
                        <th className="tableheadcolor">Amount (OMR)</th>
                        <th className="tableheadcolor">VAT Amount</th>
                        <th className="tableheadcolor">Total OMR</th>
                        <th className="tableheadcolor">Total USD</th>
                      </>
                    )}
                    {isAction == true && (
                      <>
                        <th className="tableheadcolor">Actions</th>{" "}
                      </>
                    )}
                  </tr>
                </thead>
                <Droppable droppableId="droppable-1">
                  {(provider) => (
                    <tbody
                      className="text-capitalize"
                      ref={provider.innerRef}
                      {...provider.droppableProps}
                    >
                      {chargesArray?.map((charge, index) => (
                        <Draggable
                          key={charge?._id ? charge?._id : charge?.uniqueId}
                          draggableId={
                            charge?._id ? charge?._id : charge?.uniqueId
                          }
                          index={index}
                        >
                          {(provider) => (
                            <tr
                              {...provider.draggableProps}
                              ref={provider.innerRef}
                            >
                              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                                "operations" && (
                                <>
                                  <td {...provider.dragHandleProps}> = </td>
                                </>
                              )}
                              <td>
                                {charge?.serviceId?.serviceName
                                  ? charge?.serviceId?.serviceName
                                  : charge?.serviceName}
                              </td>
                              <td>
                                {charge.chargeId?.chargeName
                                  ? charge.chargeId?.chargeName
                                  : charge.chargeName}
                              </td>
                              <td>
                                {charge.subchargeId?.subchargeName
                                  ? charge.subchargeId?.subchargeName
                                  : charge?.subchargeName}
                              </td>

                              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                                "operations" && (
                                <>
                                  {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                                    "operations" && (
                                    <>
                                      <td>{charge.vendorOMR.toFixed(3)}</td>
                                      <td>{charge.vendorVAT.toFixed(3)}</td>
                                      <td>
                                        {(
                                          parseFloat(charge.vendorOMR) +
                                          parseFloat(charge.vendorVAT)
                                        ).toFixed(3)}
                                      </td>
                                      <td>
                                        {charge.vendorTotalUSD.toFixed(2)}
                                      </td>
                                    </>
                                  )}
                                </>
                              )}

                              {isAction == true && (
                                <>
                                  <td>
                                    {/* Edit and Delete Buttons */}

                                    <i
                                      className="bi bi-pencil-square editicon"
                                      onClick={() => handleEdit(charge, index)}
                                    >
                                      {" "}
                                    </i>
                                    {pdaResponse?.pdaStatus != 7 && (
                                      <>
                                        <i
                                          className="bi bi-trash deleteicon"
                                          onClick={() =>
                                            handleDelete(charge, index)
                                          }
                                        ></i>
                                      </>
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provider.placeholder}
                    </tbody>
                  )}
                </Droppable>

                {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                  "operations" && (
                  <>
                    {chargesArray?.length > 0 && (
                      <>
                        <tfoot>
                          <tr className="bold-row">
                            <td colSpan={4}>Total Cost</td>
                            {/* Use formatted totals */}
                            {/* <td>{formattedVendorTotals.quantity}</td> */}
                            <td>{formattedVendorTotals.vendorOMR}</td>
                            <td>{formattedVendorTotals.vendorVAT}</td>
                            <td>
                              {(
                                parseFloat(formattedVendorTotals.vendorOMR) +
                                parseFloat(formattedVendorTotals.vendorVAT)
                              ).toFixed(3)}
                            </td>
                            <td>{formattedVendorTotals.vendorTotalUSD}</td>
                            {isAction == true && (
                              <>
                                <td></td> {/* Empty cell for footer */}
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </>
                    )}
                  </>
                )}
              </table>
            </DragDropContext>
          </div>
        </CustomTabPanel>
      </Box>

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default ChargesTable;
