// File: frontend/src/components/Header.js

import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand as={Link} to={user ? "/dashboard" : "/"}>GATE Master</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {user ? (
                        <Nav className="me-auto">
                            <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
                            <Nav.Link as={NavLink} to="/practice">Practice Zone</Nav.Link>
                            <Nav.Link as={NavLink} to="/challenge">Challenge Zone</Nav.Link>
                        </Nav>
                    ) : (
                         <Nav className="me-auto"></Nav> // Empty nav to push auth links to the right
                    )}
                    <Nav>
                        {user ? (
                            <Nav.Link onClick={logoutUser}>Logout</Nav.Link>
                        ) : (
                            <>
                                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;