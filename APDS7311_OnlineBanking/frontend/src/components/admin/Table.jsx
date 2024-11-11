import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import { useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const Table = () => {
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Define column definitions
  const columnDefs = [
    { headerName: "Amount", field: "amount" , sortable:true, filter:true},
    { headerName: "Account Number", field: "accountNumber" , sortable:true},
    { headerName: "SWIFT Code", field: "swiftCode" , sortable:true},
    { headerName: "Currency", field: "currency" , sortable:true, filter:true},
    { headerName: "Status", field: "status" , sortable:true, filter:true},
    { headerName: "Provider", field: "provider", sortable:true},
  ];

  // Fetch payment data from the backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/payments/view'); // Endpoint to fetch all payments
        const data = await response.json();
        setRowData(data); // Set the data to state
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, []); // Empty dependency array means this runs once when the component mounts

  const onRowClicked = (event) => {
    const paymentId = event.data._id; // assuming "_id" is the unique identifier from the database
    navigate(`/payments/view/${paymentId}`); // Correct the navigation path
  };

  return (
    <div className="ag-theme-alpine"  style={{ height: 400, width: '1000px'}}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onRowClicked={onRowClicked} // Bind row click event handler
      />
    </div>
  );
};