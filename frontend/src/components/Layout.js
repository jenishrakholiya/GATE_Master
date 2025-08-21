import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="enhanced-layout">
            <Header />
            <main className="enhanced-main">
                <div className="main-content-wrapper">
                    <div className="container-enhanced">
                        <Outlet />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
