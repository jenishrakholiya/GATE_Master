import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

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

    if (isRegistered) {
        return (
            <div className="register-container">
                <Alert className="register-success-alert">
                    <Alert.Heading>Registration Successful!</Alert.Heading>
                    <p>
                        Thank you for registering with GATE Master! We've sent a verification link to your email address.
                        Please check your inbox (and spam folder) to complete your registration.
                    </p>
                    <div className="success-login-link">
                        <Link to="/login" className="btn btn-outline-light">
                            Go to Login
                        </Link>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="register-container">
            <Card className="register-card">
                <Card.Body className="register-card-body">
                    <h2 className="register-title">Join GATE Master</h2>
                    {error && <Alert variant="danger" className="register-error-alert">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="register-form-group">
                            <Form.Label className="register-form-label">Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                placeholder="Choose a username"
                                className="register-form-control"
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="register-form-group">
                            <Form.Label className="register-form-label">Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                placeholder="Enter your email"
                                className="register-form-control"
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="register-form-group">
                            <Form.Label className="register-form-label">Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Create a strong password"
                                className="register-form-control"
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="register-form-group">
                            <Form.Label className="register-form-label">Confirm Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={password2} 
                                onChange={e => setPassword2(e.target.value)} 
                                placeholder="Confirm your password"
                                className="register-form-control"
                                required 
                            />
                        </Form.Group>
                        <Button type="submit" className="register-submit-button">
                            Create Account
                        </Button>
                    </Form>
                    
                    {/* Navigation to Login */}
                    <div className="register-links">
                        <p className="auth-switch-text">
                            Already have an account? 
                            <Link to="/login" className="auth-switch-link"> Sign in here</Link>
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegisterPage;
