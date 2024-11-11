import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const Details = () => {
  const { id } = useParams(); // Get the payment ID from the URL
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('Payment ID:', id); 
    const fetchPaymentDetails = async () => {
      setLoading(true);
      setError(null);
      console.log(`Fetching payment details for ID: ${id}`); // Log the ID being fetched
      try {
        const response = await fetch(`/payments/view/${id}?t=${new Date().getTime()}`);

        
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        console.log('Fetched payment data:', data); // Log the fetched data
        setPayment(data);
      } catch (error) {
        console.error("Error fetching payment details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };  

    if (id) {
      fetchPaymentDetails();
    }
  }, [id]);

  const handleVerify = async () => {
    console.log('Verify button clicked'); // Debug log
    const newStatus = 'submitted'; // or 'cancelled', based on your logic
    setPayment((prevPayment) => ({
      ...prevPayment,
      status: newStatus,
    }));

    // Show an alert message
    alert(`Payment status updated to: ${newStatus}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!payment) {
    return <p>No payment details available.</p>;
  }

  console.log('Payment state:', payment); // Debug log

  return (
    <div style={{ color: 'white', textAlign: 'center' }}>
      <h2>Payment Details</h2>
      <p><strong>Amount:</strong> {payment.amount || 'N/A'}</p>
      <p><strong>Account Number:</strong> {payment.accountNumber || 'N/A'}</p>
      <p><strong>SWIFT Code:</strong> {payment.swiftCode || 'N/A'}</p>
      <p><strong>Currency:</strong> {payment.currency || 'N/A'}</p>
      <p><strong>Status:</strong> {payment.status || 'N/A'}</p>
      <p><strong>Provider:</strong> {payment.provider || 'N/A'}</p>
      <button className="verify-button" onClick={handleVerify}>Verify</button>
    </div>
  );
};