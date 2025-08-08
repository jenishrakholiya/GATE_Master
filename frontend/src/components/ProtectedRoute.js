// File: frontend/src/components/ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);

    // If a user is logged in, render the child component (via Outlet).
    // Otherwise, redirect them to the /login page.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;