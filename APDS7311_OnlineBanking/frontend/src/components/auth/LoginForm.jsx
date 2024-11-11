import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/adminlogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save the token to localStorage or any state management library
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                navigate('/payments/view'); // Navigate to admin dashboard or any secure route
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleCustomerClick = () => {
        navigate('/'); // Navigating to the customer login page
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Admin Login</h1>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <FaLock className="icon" />
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox" /> Remember me</label>
                </div>
                <button type="submit">Login</button>
                <div className="login-link">
                    <p>Not an admin? <a href="#" onClick={handleCustomerClick}>Login as Customer</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
