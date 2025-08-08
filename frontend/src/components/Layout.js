// File: frontend/src/components/Layout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
                <Outlet /> {/* Child routes will be rendered here */}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;