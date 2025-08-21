import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <Navbar expand="lg" className="enhanced-navbar navbar-loading mb-0">
            <Container>
                <Navbar.Brand as={Link} to={user ? "/dashboard" : "/"} className="enhanced-brand">
                    GATE Master
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {user ? (
                        <Nav className="me-auto">
                            <Nav.Link as={NavLink} to="/dashboard" className="enhanced-nav-link">Dashboard</Nav.Link>
                            <Nav.Link as={NavLink} to="/practice" className="enhanced-nav-link">Practice Zone</Nav.Link>
                            <Nav.Link as={NavLink} to="/challenges" className="enhanced-nav-link">Challenge Zone</Nav.Link>
                            <Nav.Link as={NavLink} to="/leaderboard" className="enhanced-nav-link">Leaderboard</Nav.Link>
                            <Nav.Link as={NavLink} to="/materials" className="enhanced-nav-link">Material Zone</Nav.Link>
                            <Nav.Link as={NavLink} to="/information" className="enhanced-nav-link">Information Zone</Nav.Link>
                        </Nav>
                    ) : (
                         <Nav className="me-auto">
                            <Nav.Link as={NavLink} to="/information" className="enhanced-nav-link">Information Zone</Nav.Link>
                         </Nav>
                    )}
                    <Nav className="align-items-center">
                        {user ? (
                            <Nav.Link onClick={logoutUser} className="enhanced-auth-link">Logout</Nav.Link>
                        ) : (
                            <>
                                <Nav.Link as={NavLink} to="/login" className="enhanced-auth-link">Login</Nav.Link>
                                <Nav.Link as={NavLink} to="/register" className="enhanced-auth-link">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;


// import React, { useContext, useState } from 'react';
// import { Navbar, Nav, Container } from 'react-bootstrap';
// import { Link, NavLink } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';

// const Header = () => {
//     const { user, logoutUser } = useContext(AuthContext);
//     const [expanded, setExpanded] = useState(false);

//     // Function to handle link clicks - collapses navbar
//     const handleNavClick = () => {
//         setExpanded(false);
//     };

//     // Function to handle logout with navbar collapse
//     const handleLogout = () => {
//         setExpanded(false);
//         logoutUser();
//     };

//     return (
//         <Navbar 
//             expand="lg" 
//             className="enhanced-navbar navbar-loading mb-0"
//             expanded={expanded}
//             onToggle={setExpanded}
//         >
//             <Container>
//                 <Navbar.Brand 
//                     as={Link} 
//                     to={user ? "/dashboard" : "/"} 
//                     className="enhanced-brand"
//                     onClick={handleNavClick}
//                 >
//                     GATE Master
//                 </Navbar.Brand>
//                 <Navbar.Toggle aria-controls="basic-navbar-nav" />
//                 <Navbar.Collapse id="basic-navbar-nav">
//                     {user ? (
//                         <Nav className="me-auto">
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/dashboard" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Dashboard
//                             </Nav.Link>
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/practice" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Practice Zone
//                             </Nav.Link>
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/challenges" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Challenge Zone
//                             </Nav.Link>
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/leaderboard" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Leaderboard
//                             </Nav.Link>
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/materials" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Material Zone
//                             </Nav.Link>
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/information" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Information Zone
//                             </Nav.Link>
//                         </Nav>
//                     ) : (
//                          <Nav className="me-auto">
//                             <Nav.Link 
//                                 as={NavLink} 
//                                 to="/information" 
//                                 className="enhanced-nav-link"
//                                 onClick={handleNavClick}
//                             >
//                                 Information Zone
//                             </Nav.Link>
//                          </Nav>
//                     )}
//                     <Nav className="align-items-center">
//                         {user ? (
//                             <Nav.Link 
//                                 onClick={handleLogout} 
//                                 className="enhanced-auth-link"
//                             >
//                                 Logout
//                             </Nav.Link>
//                         ) : (
//                             <>
//                                 <Nav.Link 
//                                     as={NavLink} 
//                                     to="/login" 
//                                     className="enhanced-auth-link"
//                                     onClick={handleNavClick}
//                                 >
//                                     Login
//                                 </Nav.Link>
//                                 <Nav.Link 
//                                     as={NavLink} 
//                                     to="/register" 
//                                     className="enhanced-auth-link"
//                                     onClick={handleNavClick}
//                                 >
//                                     Register
//                                 </Nav.Link>
//                             </>
//                         )}
//                     </Nav>
//                 </Navbar.Collapse>
//             </Container>
//         </Navbar>
//     );
// };

// export default Header;
