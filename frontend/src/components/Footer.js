// File: frontend/src/components/Footer.js

import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer mt-auto py-3 bg-light">
            <Container className="text-center">
                <span className="text-muted">
                    &copy; {currentYear} GATE Master. All Rights Reserved.
                </span>
            </Container>
        </footer>
    );
};

export default Footer;