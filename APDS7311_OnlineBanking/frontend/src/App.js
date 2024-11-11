import React from 'react';  
import { BrowserRouter, Route, Routes } from 'react-router-dom';  
import Login from './components/auth/Login';  
import Register from './components/auth/Register';  
import CreatePayment from './components/Payment/CreatePayment';  
import LoginForm from'./components/auth/LoginForm';
import { TableCustom } from './components/Payment/TableCustom';
import { Table } from './components/admin/Table';  // Your table component
import { Details } from './components/admin/Details';  // Corrected import

function App() {  
  return (  
   <BrowserRouter>  
    <Routes>  
      <Route path="/" element={<Login />} />  
      <Route path="/register" element={<Register />} />  
      <Route path="/create-payment" element={<CreatePayment />} />   
      <Route path="/payments/view" element={<Table />} />
      <Route path='/table-custom' element={<TableCustom />}/>
      <Route path="/payments/view/:id" element={<Details />} />
      <Route path="/login" element={<LoginForm />}/> {/* Route to detail page with ID parameter */}
    </Routes>  
   </BrowserRouter>  

   
  );  
}  
  
export default App;