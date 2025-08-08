// File: frontend/src/pages/LoginPage.js

import React, { useContext } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card className="auth-card">
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>
                    <Form onSubmit={loginUser}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" name="username" placeholder="Enter username" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="password" placeholder="Password" required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default LoginPage;