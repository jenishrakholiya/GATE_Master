import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="enhanced-footer footer-fade-in">
            <Container>
                <div className="enhanced-footer-content">
                    <p className="enhanced-copyright">
                        &copy; {currentYear} <span className="footer-brand">GATE Master</span>. All Rights Reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
