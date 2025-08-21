import React, { useContext } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    
    return (
        <div className="login-container">
            <Card className="login-card">
                <Card.Body className="login-card-body">
                    <h2 className="login-title">Welcome Back</h2>
                    <Form onSubmit={loginUser}>
                        <Form.Group className="login-form-group" controlId="username">
                            <Form.Label className="login-form-label">Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="username" 
                                placeholder="Enter your username" 
                                className="login-form-control"
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="login-form-group" controlId="password">
                            <Form.Label className="login-form-label">Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="password" 
                                placeholder="Enter your password" 
                                className="login-form-control"
                                required 
                            />
                        </Form.Group>
                        <Button type="submit" className="login-submit-button">
                            Login
                        </Button>
                    </Form>
                    
                    {/* Navigation to Register */}
                    <div className="login-links">
                        <p className="auth-switch-text">
                            Don't have an account? 
                            <Link to="/register" className="auth-switch-link"> Sign up here</Link>
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default LoginPage;
