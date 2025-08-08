// File: frontend/src/pages/DashboardPage.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    // ... (the useEffect and state logic remains exactly the same)
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/');
                setDashboardData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch dashboard data. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading Dashboard...</p>
            </Container>
        );
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }


    return (
        <Container className="mt-4">
            <div className="p-4 mb-4 bg-light rounded-3">
                <h2>Welcome back, {dashboardData.username}!</h2>
                <p className="lead">You're ready to start preparing. Select one of the zones below to begin.</p>
            </div>
            
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Practice Zone</Card.Title>
                            <Card.Text className="text-muted flex-grow-1">
                                Sharpen your skills with subject-wise practice questions.
                            </Card.Text>
                            <Button variant="primary">Go to Practice</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                         <Card.Body className="d-flex flex-column">
                            <Card.Title>Challenge Zone</Card.Title>
                            <Card.Text className="text-muted flex-grow-1">
                                Take a full-length mock test and get your predicted rank.
                            </Card.Text>
                            <Button variant="secondary">Start a Challenge</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Your Analytics</Card.Title>
                            <Card.Text className="text-muted flex-grow-1">
                                View your performance insights and track your progress over time.
                            </Card.Text>
                             <Button variant="outline-secondary">View Profile</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                    <Card.Body className="d-flex flex-column">
                    <Card.Title>Mock Test</Card.Title>
                    <Card.Text className="text-muted flex-grow-1">
                        Take a full-length mock test and get your predicted rank.
                    </Card.Text>
                    <Button as={Link} to="/practice" variant="primary">Go to Mock Test</Button>
                    </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;