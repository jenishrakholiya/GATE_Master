// File: frontend/src/pages/EmailVerificationPage.js

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert, Button, Spinner } from 'react-bootstrap';

const EmailVerificationPage = () => {
    const { uidb64, token } = useParams();
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await axios.get(`http://localhost:8000/api/verify/${uidb64}/${token}/`);
                setVerificationStatus('success');
            } catch (error) {
                setVerificationStatus('error');
            }
        };

        verifyEmail();
    }, [uidb64, token]);

    return (
        <Container className="mt-5 text-center">
            <h2>Email Verification</h2>
            {verificationStatus === 'verifying' && (
                <div>
                    <Spinner animation="border" />
                    <p className="mt-2">Verifying your email address...</p>
                </div>
            )}
            {verificationStatus === 'success' && (
                <Alert variant="success">
                    <Alert.Heading>Success!</Alert.Heading>
                    <p>Your email has been successfully verified. You can now log in to your account.</p>
                    <hr />
                    <div className="d-flex justify-content-center">
                        <Button as={Link} to="/login" variant="outline-success">
                            Go to Login
                        </Button>
                    </div>
                </Alert>
            )}
            {verificationStatus === 'error' && (
                <Alert variant="danger">
                    <Alert.Heading>Error!</Alert.Heading>
                    <p>This verification link is invalid or has expired. Please try registering again.</p>
                </Alert>
            )}
        </Container>
    );
};

export default EmailVerificationPage;