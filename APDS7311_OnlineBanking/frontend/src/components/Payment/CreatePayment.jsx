// This Imports necessary dependencies  
import axios from 'axios';  
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePayment.css';  
  
// This Defines the CreatePayment component  
const CreatePayment = () => {  
  // Initialize state variables for form fields  
  const [amount, setAmount] = useState('');  
  const [accountNumber, setAccountNumber] = useState('');  
  const [swiftCode, setSwiftCode] = useState('');  
  const [currency, setCurrency] = useState('');  
  const [provider, setProvider] = useState(''); 

  // Initialize the navigate hook for routing  
  const navigate = useNavigate();  
  
  // Define the handleSubmit function to handle form submission  
  const handleSubmit = async (e) => {  
   // Prevent default form submission behavior  
   e.preventDefault();  
   console.log("Form submitted");

   // Validate all fields
   if (!amount || !accountNumber || !swiftCode || !currency || !provider) {
    alert('All fields must be filled out');
    return;
  }
   // Validate the amount field
   if (Number(amount) <= 0) {  
    // Display an alert if the amount is not a positive number  
    alert('Amount must be a positive number');  
    return;  
   }  
  
   try {  
    // Send a POST request to the /api/payments endpoint with form data  
    const response = await axios.post('/payments/add', {  
      amount,
      accountNumber,
      swiftCode,
      currency,
      provider
    });  
  
    // Navigate to the payment history page after successful submission  
    
      if (response.status === 200) {
        
        // Navigate to the payment history page after successful submission  
        console.log('Payment response:', response);
        navigate('/table-custom');
      } else {
        alert('Payment submission failed');
      }
     } catch (error) {
       console.error("Error during payment submission:", error);
       alert('Payment submission failed');
     } 
    }; 
  
  // Returns the JSX for the Create Payment form  
  return (  
   <div className="wrapper">  
    <h1>Create Payment</h1>  
    <form onSubmit={handleSubmit}>  
      <div className="input-box">  
       <input  
        type="number"  
        value={amount}  
        onChange={(e) => setAmount(e.target.value)}  
        placeholder="Amount"  
       />  
      </div>  
      <div className="input-box">  
          <input  
            type="text"  
            value={accountNumber}  
            onChange={(e) => setAccountNumber(e.target.value)}  
            placeholder="Account Number"  
          />  
      </div>  
      <div className="input-box">  
          <input  
            type="text"  
            value={swiftCode}  
            onChange={(e) => setSwiftCode(e.target.value)}  
            placeholder="SWIFT Code"  
          />  
      </div>  
      <div className="input-box">  
       <select  
        value={currency}  
        onChange={(e) => setCurrency(e.target.value)}  
        style={{ width: '200px' }}  
       >  
        <option value="">Select Currency</option>  
        <option value="USD">USD</option>  
        <option value="EUR">EUR</option>  
        <option value="ZAR">ZAR</option>  
        <option value="GBP">GBP</option>  
        <option value="INR">INR</option>  
       </select>  
      </div>  
      <div className="input-box">  
       <select  
        value={provider}  
        onChange={(e) => setProvider(e.target.value)}  
        style={{ width: '200px' }}  
       >  
        <option value="">Select Provider</option>  
        <option value="Paypal">PayPal</option>  
        <option value="Stripe">Stripe</option>  
        <option value="Square">Square</option>  
       </select>  
      </div>  
      <button type="submit">Create Payment</button>  
    </form>  
   </div>  
  );  
};  
  
// This Exports the CreatePayment component  
export default CreatePayment;



// MDN Web Docs, 2023. *Styling web forms*. [online] Available at: <https://developer.mozilla.org/en-US/docs/Learn/Forms/Styling_web_forms> [Accessed 30 September 2023].
