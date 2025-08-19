import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    
    const [user, setUser] = useState(() => 
        localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null
    );

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                alert('Login failed! Please check your credentials or verify your account.');
            }
        } catch (error) {
            console.error("Login request error", error);
            alert("An error occurred during login.");
        }
    };

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }, []);

    const contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    useEffect(() => {
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
                    // --- SUCCESS ---
                    // Token refreshed successfully
                    setAuthTokens(data);
                    setUser(jwtDecode(data.access));
                    localStorage.setItem('authTokens', JSON.stringify(data));
                } else {
                    // --- PERMANENT FAILURE ---
                    // This happens if the refresh token is expired or invalid.
                    // THIS is when we should log the user out.
                    logoutUser();
                }
            } catch (error) {
                // --- TEMPORARY FAILURE ---
                // This happens on a network error. We will NOT log out.
                // The next interval tick will try again.
                console.error("Token refresh network error. Will retry.", error);
            }
            if (loading) {
                setLoading(false);
            }
        };

        if (loading) {
            updateToken();
        }

        const fourMinutes = 1000 * 60 * 4;
        const interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, fourMinutes);

        return () => clearInterval(interval);
    }, [authTokens, loading, logoutUser]);


    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};