import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BarChartLineFill, Bullseye, Journals, Linkedin, Github } from 'react-bootstrap-icons';

const LandingPage = () => {
    return (
        <>
            {/* Hero Section */}
            <div className="hero-section">
                <Container>
                    <div className="hero-content">
                        <h1 className="hero-title">Ace the GATE CS Exam with Confidence</h1>
                        <p className="hero-subtitle">
                            Master every concept, practice with expert-curated questions, and achieve your target score with our comprehensive GATE preparation platform.
                        </p>

                        <Button as={Link} to="/register" className="hero-cta-button">
                            Get Started for Free
                        </Button>
                    </div>
                </Container>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <Container>
                    <h2 className="features-title">Why Choose GATE Master?</h2>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="feature-card">
                                <Card.Body className="feature-card-body">
                                    <div className="feature-icon icon-primary">
                                        <Journals size={35} />
                                    </div>
                                    <Card.Title className="feature-title">Extensive Practice Zone</Card.Title>
                                    <Card.Text className="feature-description">
                                        Tackle quizzes from a vast, curated question bank covering all 11 core subjects of the GATE CS syllabus.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="feature-card">
                                <Card.Body className="feature-card-body">
                                    <div className="feature-icon icon-success">
                                        <Bullseye size={35} />
                                    </div>
                                    <Card.Title className="feature-title">Realistic Challenge Zone</Card.Title>
                                    <Card.Text className="feature-description">
                                        Simulate the real exam experience with full-length mock tests, complete with timers and negative marking.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="feature-card">
                                <Card.Body className="feature-card-body">
                                    <div className="feature-icon icon-warning">
                                        <BarChartLineFill size={35} />
                                    </div>
                                    <Card.Title className="feature-title">Personalized Analytics</Card.Title>
                                    <Card.Text className="feature-description">
                                        Track your progress with detailed reports, identify your weak spots, and focus on what matters most.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Call to Action Section */}
            <div className="cta-section">
                <Container>
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Start Your Journey?</h2>
                        <p className="cta-subtitle">
                            Join thousands of aspirants and take the next step towards your dream institute.
                        </p>
                        <Button as={Link} to="/register" className="cta-button">
                            Sign Up Now
                        </Button>
                    </div>
                </Container>
            </div>

            {/* Developer Links Section */}
            <div className="developer-links-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={6} className="text-center">
                            <div className="developer-content">
                                <h4 className="developer-title">Where GATE dreams become reality</h4>
                                <p className="developer-subtitle">
                                    Connect with us on social platforms for updates and support
                                </p>
                                <div className="social-links">
                                    <a 
                                        href="https://www.linkedin.com/in/jenish-rakholiya-161519319?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link linkedin-link"
                                    >
                                        <Linkedin size={24} />
                                        <span>LinkedIn</span>
                                    </a>
                                    <a 
                                        href="https://github.com/jenishrakholiya" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link github-link"
                                    >
                                        <Github size={24} />
                                        <span>GitHub</span>
                                    </a>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default LandingPage;
