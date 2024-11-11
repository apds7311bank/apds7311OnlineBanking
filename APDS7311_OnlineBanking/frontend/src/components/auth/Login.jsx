import React, { useState } from "react";   
import "./Login.css";   
import { FaUser, FaLock } from "react-icons/fa";   
import axios from 'axios';   
import { useNavigate } from "react-router-dom";   
import { MdAccountBalance} from "react-icons/md";


/*
 * This code is adapted from the YouTube tutorial "Login form in React JS" by CodeHal.
 * Available at: https://www.youtube.com/watch?v=kghwFYOJiNg
 */
   
const Login = () => {   
  // Defining state variables to hold input values and error messages
  const [username, setUsername] = useState('');   // State to manage username input
  const [password, setPassword] = useState('');   // State to manage password input
  const [accountnumber, setAccountNumber] = useState('');  // State to manage account number input
  const [error, setError] = useState('');   // State to manage any login errors
  const navigate = useNavigate();   // Hook to allow programmatic navigation between routes
  
  // Function to handle form submission and login logic
  const handleSubmit = async (e) => {   
    e.preventDefault();   // Preventing the default form submission
    setError("");   // Resetting any previous error messages

     // Validation: Check if all fields are filled
     if (!username.trim() || !accountnumber.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;  // Exit the function if validation fails
    }
    if (isNaN(accountnumber)) {
      setError('Account number must be numeric');
      return;
    }

    try {   
      // Making POST request to the backend for login
      const response = await axios.post('/api/auth/login', { 
        username: username.trim(), 
        accountnumber: accountnumber.trim(), 
        password: password.trim()
      });  
      // On successful login, storing the authentication token in local storage
      localStorage.setItem('token', response.data.token);   
      
      // Navigating to the payment page after successful login
      navigate('/table-custom');    
    } catch (err) {   
      // Setting error message if login fails
      if (err.response && err.response.data.message) {   
        setError(err.response.data.message);   
      } else{
        setError('Something went wrong, please try again.');
      }
    }   
  };   
   
  
  // Function to handle click on the 'Register' link, redirecting to the registration page
  const handleRegisterClick = () => {   
    navigate('/register');   // Navigating to the register page
  };  
  const handleAdminClick = () => {   
    navigate('/login');   // Navigating to the register page
  };  
   
  return (   
  <div className="wrapper">   
   <h1>Login</h1>   
   <form onSubmit={handleSubmit}>   
    <div className="input-box">   
     <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="true" placeholder="Username" />   
     <FaUser className="icon" />
    </div>   
    <div className="input-box">   
     <input type="text" name="accountnumber" value={accountnumber} onChange={(e) => setAccountNumber(e.target.value)} autoComplete="true" placeholder="Account number" />   
     <MdAccountBalance className="icon" />   
    </div> 
    <div className="input-box">   
     <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />   
     <FaLock className="icon" />   
    </div>   
    {/* Displaying error message if login fails */}
    {error && <p style={{ color: 'red' }}>{error}</p>}   
   
    <div className="remember-forgot">   
     <label><input type="checkbox" />Remember me</label>     
    </div>   
    <button type="submit">Login</button>   
    <div className="register-link">   
     <p>Don't have an account? <a href="#" onClick={handleRegisterClick}>Register</a></p>   
      {/* Link to trigger registration page navigation */}
    </div>     
    <div className="admin-link">   
     <p>Not a Customer? <a href="#" onClick={handleAdminClick}>Switch to admin</a></p>   
      {/* Link to trigger registration page navigation */}
    </div>  
   </form>   
  </div>   
  );   
};   
   
export default Login;