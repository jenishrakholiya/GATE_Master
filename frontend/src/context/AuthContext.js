import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    // Get auth tokens from localStorage, or set to null if they don't exist
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    
    // Decode user from auth tokens in localStorage, or set to null
    const [user, setUser] = useState(() => 
        localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null
    );

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    /**
     * Handles user login by sending credentials to the backend token endpoint.
     * On success, sets user state, stores tokens in localStorage, and navigates to the dashboard.
     */
    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'username': e.target.username.value, 'password': e.target.password.value })
            });
            const data = await response.json();

            if (response.status === 200) {
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                // You can get more specific error messages from `data` if your backend sends them
                alert('Login failed! Please check your credentials or verify your account.');
            }
        } catch (error) {
            console.error("Login request error", error);
            alert("An error occurred during login.");
        }
    };

    /**
     * Handles user logout by clearing state and localStorage, then redirecting to the login page.
     */
    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    /**
     * Context data that will be passed down to all children components.
     */
    const contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    /**
     * This useEffect hook handles the automatic refreshing of the JWT access token.
     * It runs on an interval to request a new token before the old one expires.
     */
    useEffect(() => {
        // Function to update the access token using the refresh token
        const updateToken = async () => {
            if (!authTokens) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:8000/api/token/refresh/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'refresh': authTokens.refresh })
                });

                const data = await response.json();
                
                if (response.status === 200) {
                    setAuthTokens(data);
                    setUser(jwtDecode(data.access));
                    localStorage.setItem('authTokens', JSON.stringify(data));
                } else {
                    // If the refresh token is expired or invalid, log the user out
                    logoutUser();
                }
            } catch (error) {
                console.error("Token refresh error", error);
                logoutUser();
            }

            if (loading) {
                setLoading(false);
            }
        };

        // Run the updateToken function immediately on first load
        if (loading) {
            updateToken();
        }

        // Set an interval to refresh the token every 4 minutes
        const fourMinutes = 1000 * 60 * 4;
        const interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, fourMinutes);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);

    }, [authTokens, loading]); // Dependencies for the hook


    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};