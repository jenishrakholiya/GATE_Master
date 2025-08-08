// File: frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const RegisterPage = () => {
    // --- THIS BLOCK WAS LIKELY MISSING ---
    // This is where we declare all the state variables for our form.
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();
    // ------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== password2) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/register/', {
                username,
                email,
                password,
                password2
            });
            setIsRegistered(true);
        } catch (err) {
            setError('Failed to register. Username or email might already exist.');
            console.error(err);
        }
    };

    // If registration is successful, show a message instead of the form
    if (isRegistered) {
        return (
            <Container className="mt-5" style={{ maxWidth: '600px' }}>
                <Alert variant="success">
                    <Alert.Heading>Registration Successful!</Alert.Heading>
                    <p>
                        Thank you for registering. We've sent a verification link to your email address.
                        Please check your inbox (and spam folder) to complete your registration.
                    </p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5" style={{ maxWidth: '500px' }}>
            <h2>Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" value={password2} onChange={e => setPassword2(e.target.value)} required />
                </Form.Group>
                <Button variant="primary" type="submit">Register</Button>
            </Form>
        </Container>
    );
};

export default RegisterPage;