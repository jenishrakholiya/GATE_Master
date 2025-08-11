// File: frontend/src/pages/LandingPage.js

import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BarChartLineFill, Bullseye, Journals } from 'react-bootstrap-icons';

const LandingPage = () => {
    return (
        <>
            {/* Hero Section */}
            <div className="bg-light py-5">
                <Container className="text-center py-5">
                    <h1 className="display-4 fw-bold">Ace the GATE CS Exam with Confidence</h1>
                    <p className="lead text-muted mt-3 mb-4">
                        Leverage data-driven insights, practice with thousands of questions, and track your progress with our all-in-one preparation platform.
                    </p>
                    <Button as={Link} to="/register" variant="primary" size="lg">Get Started for Free</Button>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="py-5">
                <h2 className="text-center mb-5">Why Choose GATE Master?</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <Journals size={50} className="text-primary mb-3" />
                                <Card.Title as="h4">Extensive Practice Zone</Card.Title>
                                <Card.Text className="text-muted">
                                    Tackle quizzes from a vast, curated question bank covering all 11 core subjects of the GATE CS syllabus.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <Bullseye size={50} className="text-success mb-3" />
                                <Card.Title as="h4">Realistic Challenge Zone</Card.Title>
                                <Card.Text className="text-muted">
                                    Simulate the real exam experience with full-length mock tests, complete with timers and negative marking.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <BarChartLineFill size={50} className="text-warning mb-3" />
                                <Card.Title as="h4">Personalized Analytics</Card.Title>
                                <Card.Text className="text-muted">
                                    Track your progress with detailed reports, identify your weak spots, and focus on what matters most.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

             {/* Call to Action Section */}
             <div className="bg-light py-5">
                <Container className="text-center py-4">
                    <h2 className="fw-bold">Ready to Start Your Journey?</h2>
                    <p className="lead text-muted mt-3 mb-4">
                        Join thousands of aspirants and take the next step towards your dream institute.
                    </p>
                    <Button as={Link} to="/register" variant="success" size="lg">Sign Up Now</Button>
                </Container>
            </div>
        </>
    );
};

export default LandingPage;