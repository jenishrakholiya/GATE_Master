import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

// The Yup validation schema remains the same, providing detailed error messages.
const validationSchema = Yup.object().shape({
    username: Yup.string().max(10, 'Username must be 10 characters or less').required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters long').matches(/[A-Z]/, 'Password must contain at least one uppercase letter').matches(/[a-z]/, 'Password must contain at least one lowercase letter').matches(/[0-9]/, 'Password must contain at least one number').matches(/[\W_]/, 'Password must contain at least one special character').required('Password is required'),
    password2: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Password confirmation is required'),
});

const RegisterPage = () => {
    const [serverError, setServerError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (values, { setSubmitting }) => {
        setServerError('');
        try {
            await axios.post('http://localhost:8000/api/register/', {
                username: values.username,
                email: values.email,
                password: values.password,
                password2: values.password2,
            });
            setIsRegistered(true);
        } catch (err) {
            const errorData = err.response?.data;
            let errorMsg = 'Registration failed. Please try again.';
            if (errorData) {
                errorMsg = Object.values(errorData).flat().join(' ');
            }
            setServerError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (isRegistered) {
        return (
            <Container className="d-flex justify-content-center align-items-center register-container" style={{ minHeight: '80vh' }}>
                <Alert variant="success" className="text-center shadow-sm p-4 register-success-alert">
                    <Alert.Heading>Registration Successful!</Alert.Heading>
                    <p>Thank you for registering! We've sent a verification link to your email. Please check your inbox to complete your registration.</p>
                    <hr />
                    <div className="success-login-link">
                        <Button as={Link} to="/login" variant="primary" className="btn-outline-light">Go to Login</Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center register-container" style={{ minHeight: '80vh' }}>
            <Card className="auth-card register-card">
                <Card.Body className="register-card-body">
                    <h2 className="text-center mb-4 register-title">Join GATE Master</h2>
                    {serverError && <Alert variant="danger" className="register-error-alert">{serverError}</Alert>}
                    
                    <Formik
                        initialValues={{ username: '', email: '', password: '', password2: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleRegister}
                    >
                        {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => {
                            // Lightweight Password Strength Checker
                            const checkPasswordStrength = (password) => {
                                let score = 0;
                                if (!password) return 0;
                                if (password.length >= 8) score++;
                                if (/[A-Z]/.test(password)) score++;
                                if (/[a-z]/.test(password)) score++;
                                if (/[0-9]/.test(password)) score++;
                                if (/[\W_]/.test(password)) score++;
                                return Math.min(score, 4);
                            };

                            const strengthScore = checkPasswordStrength(values.password);
                            const strengthPercentage = (strengthScore / 4) * 100;

                            const getStrengthProps = () => {
                                switch (strengthScore) {
                                    case 0: return { label: 'Weak', variant: 'danger' };
                                    case 1: return { label: 'Weak', variant: 'danger' };
                                    case 2: return { label: 'Fair', variant: 'warning' };
                                    case 3: return { label: 'Good', variant: 'info' };
                                    case 4: return { label: 'Strong', variant: 'success' };
                                    default: return { label: '', variant: 'secondary' };
                                }
                            };
                            const { label, variant } = getStrengthProps();

                            return (
                                <Form noValidate onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3 register-form-group" controlId="username">
                                        <Form.Label className="register-form-label">Username</Form.Label>
                                        <Form.Control type="text" name="username" placeholder="Choose a username (max 10 chars)" value={values.username} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.username && !!errors.username} className="register-form-control" />
                                        <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-3 register-form-group" controlId="email">
                                        <Form.Label className="register-form-label">Email</Form.Label>
                                        <Form.Control type="email" name="email" placeholder="Enter your email" value={values.email} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.email && !!errors.email} className="register-form-control" />
                                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3 register-form-group" controlId="password">
                                        <Form.Label className="register-form-label">Password</Form.Label>
                                        <Form.Control type="password" name="password" placeholder="Create a strong password" value={values.password} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.password && !!errors.password} className="register-form-control" />
                                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                        
                                        {values.password && (
                                            <>
                                                <ProgressBar now={strengthPercentage} variant={variant} style={{ height: '8px' }} className="mt-2" />
                                                <Form.Text style={{ color: `var(--bs-${variant})`, fontWeight: '500' }}>
                                                    Strength: {label}
                                                </Form.Text>
                                            </>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3 register-form-group" controlId="password2">
                                        <Form.Label className="register-form-label">Confirm Password</Form.Label>
                                        <Form.Control type="password" name="password2" placeholder="Confirm your password" value={values.password2} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.password2 && !!errors.password2} className="register-form-control" />
                                        <Form.Control.Feedback type="invalid">{errors.password2}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="w-100 register-submit-button" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Create Account'}
                                    </Button>
                                </Form>
                            );
                        }}
                    </Formik>
                    <div className="text-center mt-3 register-links">
                        <small className="text-muted auth-switch-text">
                            Already have an account? <Link to="/login" className="auth-switch-link">Sign in here</Link>
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterPage;
