import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Spinner, Alert, Card, Row, Col, Accordion, Table } from 'react-bootstrap';
import axios from 'axios';

const InformationZonePage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/information/news/');
                setArticles(response.data);
            } catch (err) {
                setError('Failed to load news. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <Container className="mt-4">
            <Row>
                {/* --- Column 1: News & Updates --- */}
                <Col lg={7} className="mb-4">
                    <Card className="news-card shadow-sm h-100">
                        <Card.Header as="h5">News & Updates</Card.Header>
                        {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : error ? (
                            <Alert variant="danger" className="m-3">{error}</Alert>
                        ) : (
                            <ListGroup variant="flush" className="news-list">
                                {articles.length > 0 ? (
                                    articles.map(article => (
                                        <ListGroup.Item key={article.id} action href={article.link} target="_blank" rel="noopener noreferrer">
                                            <div className="d-flex w-100 justify-content-between">
                                                <h6 className="mb-1 fw-bold">{article.title}</h6>
                                                <small className="text-nowrap ps-3">{new Date(article.publication_date).toLocaleDateString()}</small>
                                            </div>
                                            <p className="mb-1 text-muted small">{article.description}</p>
                                            <small>Source: {article.source}</small>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item>
                                        <p className="text-center text-muted my-3">No recent news found.</p>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        )}
                    </Card>
                </Col>

                {/* --- Column 2: Exam Pattern & Info --- */}
                <Col lg={5} className="mb-4">
                    <Card className="pattern-card shadow-sm h-100">
                        <Card.Header as="h5">GATE Exam Pattern & Structure</Card.Header>
                        <Card.Body>
                            <Accordion defaultActiveKey="0" alwaysOpen className="info-accordion">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Exam Mode & Duration</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item><strong>Mode:</strong> Computer Based Test (CBT)</ListGroup.Item>
                                            <ListGroup.Item><strong>Duration:</strong> 3 Hours (180 Minutes)</ListGroup.Item>
                                            <ListGroup.Item><strong>Total Questions:</strong> 65</ListGroup.Item>
                                            <ListGroup.Item><strong>Total Marks:</strong> 100</ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Question Types & Marking Scheme</Accordion.Header>
                                    <Accordion.Body>
                                        <Table striped bordered size="sm" className="pattern-table">
                                            <thead>
                                                <tr><th>Type</th><th>Negative Marking</th></tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td><strong>MCQ</strong> (Multiple Choice)</td>
                                                    <td>Yes (-1/3 for 1-mark, -2/3 for 2-mark)</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>MSQ</strong> (Multiple Select)</td>
                                                    <td>No negative marking</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>NAT</strong> (Numerical Answer)</td>
                                                    <td>No negative marking</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                        <small className="text-muted">For MSQs, you get marks ONLY if you select all correct options and no wrong options.</small>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Sectional Distribution</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item><strong>General Aptitude (GA):</strong> 10 questions for a total of 15 marks.</ListGroup.Item>
                                            <ListGroup.Item><strong>Core Subject + Engg. Maths:</strong> 55 questions for a total of 85 marks.</ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="3">
                                    <Accordion.Header>GATE CS Subjects</Accordion.Header>
                                    <Accordion.Body>
                                        <div className="subjects-grid">
                                            <Col>• Engineering Maths</Col>
                                            <Col>• Digital Logic</Col>
                                            <Col>• Computer Organization</Col>
                                            <Col>• Programming & DS</Col>
                                            <Col>• Algorithms</Col>
                                            <Col>• Theory of Computation</Col>
                                            <Col>• Compiler Design</Col>
                                            <Col>• Operating Systems</Col>
                                            <Col>• Databases (DBMS)</Col>
                                            <Col>• Computer Networks</Col>
                                            <Col>• General Aptitude</Col>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default InformationZonePage;