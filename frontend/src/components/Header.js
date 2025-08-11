// File: frontend/src/components/Header.js

import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext'; 
import { SunFill, MoonStarsFill } from 'react-bootstrap-icons'; 

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext); 

    return (
        <Navbar bg="light" expand="lg" className="mb-3 shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to={user ? "/dashboard" : "/"}>GATE Master</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {user ? (
                        <Nav className="me-auto">
                            <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
                            <Nav.Link as={NavLink} to="/practice">Practice Zone</Nav.Link>
                            <Nav.Link as={NavLink} to="/challenges">Challenge Zone</Nav.Link>
                            <Nav.Link as={NavLink} to="/leaderboard">Leaderboard</Nav.Link>
                            <Nav.Link as={NavLink} to="/information">Information Zone</Nav.Link>
                        </Nav>
                    ) : (
                         <Nav className="me-auto">
                            <Nav.Link as={NavLink} to="/information">Information Zone</Nav.Link>
                         </Nav>
                    )}
                    <Nav className="align-items-center">
                        <Button variant="outline-secondary" onClick={toggleTheme} className="me-2">
                            {theme === 'light' ? <MoonStarsFill /> : <SunFill />}
                        </Button>

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