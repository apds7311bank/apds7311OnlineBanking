// Import necessary libraries and components  
import React, { useState } from "react"; // [1]  
import axios from "axios"; // [2]  
import { useNavigate } from "react-router-dom"; // [3]  
import { FaUser, FaLock } from "react-icons/fa"; // [4]  
import { MdAccountBalance } from "react-icons/md"; // [5]  
import { FaRegIdCard } from "react-icons/fa"; // [6]  
  
// Define the Register component  
function Register() {  
  // Initialize state variables for form fields  
  const [fullname, setFullName] = useState(''); // [7]  
  const [username, setUsername] = useState(''); // [8]  
  const [idnumber, setIdNumber] = useState(''); // [9]  
  const [accountnumber, setAccountNumber] = useState(''); // [10]  
  const [password, setPassword] = useState(''); // [11]  
  const [error, setError] = useState(''); // [13]  
  const navigate = useNavigate(); // [14]  
  
  // Define the handleSubmit function to handle form submission  
  const handleSubmit = async (e) => {  
   // Prevent default form submission behavior  
   e.preventDefault(); // [15]  
   // Clear any existing error messages  
   setError(""); // [16]  
  
  // Frontend validation
  if (fullname.trim().length < 3) {
    setError('Full name must be at least 3 characters long');
    return;
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    setError('Username must contain only letters and numbers');
    return;
  }
  if (isNaN(accountnumber) || accountnumber.trim() === '') {
    setError('Account number must be numeric');
    return;
  }
  if (idnumber.trim().length < 6) {
    setError('ID number must be at least 6 characters long');
    return;
  }
  if (password.length < 8) {
    setError('Password must be at least 8 characters long');
    return;
  }


   try {  
    // Made a POST request to the /api/auth/register endpoint with form data  
    const response = await axios.post('/api/auth/register', { // [17]  
      fullname,  
      username,  
      idnumber,  
      accountnumber,  
      password 
    });  
  
    // This is to Check if the response status is 201 (Created)  
    if (response.status === 201) { // [18]  
      // Display a success message and navigate to the login page  
      alert("Registration successful!"); // [19]  
      navigate('/'); // [20]  
    }  
   } catch (err) {  
    if (err.response) {
      // Check if the response is from the server
      if (err.response.data.errors) {
        const messages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(messages);
      } else {
        setError(err.response.data.message || 'An error occurred. Please try again.');
      }
    } else {
      // Handle network errors
      setError('Network error. Please check your connection.');
    }
   }  
  };  
  
  const handleLoginClick = () => {   
    navigate('/');   // Navigating to the register page
  }; 
  
  // Return the JSX for the registration form  
  return (  
   <div className="wrapper">  
    <h1>Register</h1>  
    <form onSubmit={handleSubmit}>  
      <div className="input-box">  
       <input  
        type="text"  
        value={fullname}  
        onChange={(e) => setFullName(e.target.value)}  
        placeholder="Full Name"  
       />  
       <FaUser className="icon" />  
      </div>  
      <div className="input-box">  
       <input  
        type="text"  
        value={username}  
        onChange={(e) => setUsername(e.target.value)}  
        placeholder="Username"  
       />  
       <FaUser className="icon" />  
      </div>  
      <div className="input-box">  
       <input  
        type="text"  
        value={idnumber}  
        onChange={(e) => setIdNumber(e.target.value)}  
        placeholder="ID Number"  
       />  
       <FaRegIdCard className="icon"/>  
      </div>  
      <div className="input-box">  
       <input  
        type="text"  
        value={accountnumber}  
        onChange={(e) => setAccountNumber(e.target.value)}  
        placeholder="Account Number"  
       />  
       <MdAccountBalance className="icon" />  
      </div>  
      <div className="input-box">  
       <input  
        type="password"  
        value={password}  
        onChange={(e) => setPassword(e.target.value)}  
        placeholder="Password"  
       />  
       <FaLock className="icon" />  
      </div>  
      {error && <p style={{ color: 'red' }}>{error}</p>}  
      <button type="submit">Register</button>  
      <div className="register-link">   
     <p>Have an account? <a href="#" onClick={handleLoginClick}>Login</a></p>   
       
     </div>  
    </form>  
   </div>  
  );  
}  
  
// Export the Register component  
export default Register;

//2. Flowbite, 2019. *Forms*. [online] Available at: <https://flowbite.com/docs/components/forms/> [Accessed 30 September 2023]. 
