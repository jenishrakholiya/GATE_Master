// File: frontend/src/pages/ChallengeResultPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Accordion, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChallengeResultPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axiosInstance.get(`/challenges/result/${attemptId}/`);
                setResultData(response.data);
            } catch (err) {
                setError('Failed to load results.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [attemptId]);

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /><h3>Calculating Your Results...</h3></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!resultData) return <Container className="mt-5"><Alert variant="info">No result data found.</Alert></Container>;

    // Chart logic
    const totalQuestions = resultData.detailed_results.length;
    const correctCount = resultData.correct_count;
    const incorrectCount = totalQuestions - correctCount;
    const doughnutData = {
        labels: ['Correct', 'Incorrect / Unanswered'],
        datasets: [{
            data: [correctCount, incorrectCount],
            backgroundColor: ['#10B981', '#6c757d'],
            borderColor: ['var(--bs-card-bg)', 'var(--bs-card-bg)'],
            borderWidth: 2,
        }],
    };
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'bottom', labels: { color: 'var(--bs-body-color)' } },
            title: { display: true, text: 'Question Status', font: { size: 16 }, color: 'var(--bs-body-color)' },
        },
        cutout: '60%',
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-sm mb-4">
                <Card.Header as="h4" className="text-center">{resultData.challenge_title} - Report</Card.Header>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={4} style={{ height: '250px' }}>
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </Col>
                        <Col md={8}>
                            <h2 className="text-center">Final Score: {resultData.score} / 100</h2>
                            <ListGroup variant="flush" className="mt-3">
                                {/* --- UPDATED STATS BREAKDOWN --- */}
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Marks Gained:</strong> 
                                    <span className="text-success fw-bold">+{resultData.positive_marks}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Negative Marks:</strong> 
                                    <span className="text-danger fw-bold">-{resultData.negative_marks}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Correct Answers:</strong> 
                                    <Badge bg="success" pill>{correctCount} / {totalQuestions}</Badge>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer className="text-center">
                    <Button variant="primary" onClick={() => navigate('/challenges')}>Back to Challenges</Button>
                </Card.Footer>
            </Card>

            <h3 className="mt-5">Detailed Question Review</h3>
            {/* The Accordion for review remains unchanged */}
            <Accordion>
                {resultData.detailed_results.map((res, index) => (
                     <Accordion.Item eventKey={index.toString()} key={res.id}>
                        <Accordion.Header>
                            <span className="fw-bold me-2">Question {index + 1}</span>
                            {res.is_correct ? <CheckCircleFill className="text-success" /> : <XCircleFill className="text-danger" />}
                        </Accordion.Header>
                        <Accordion.Body>
                            <p dangerouslySetInnerHTML={{ __html: `<strong>${res.question_text}</strong>` }}/>
                            {res.question_image && <img src={res.question_image} alt="Question figure" className="img-fluid my-2" />}
                            <p className={res.is_correct ? 'text-correct' : 'text-wrong'}>
                                Your Answer: {res.user_answer || 'Not Answered'}
                            </p>
                            {!res.is_correct && <p className="text-correct">Correct Answer: {res.correct_answer}</p>}
                            <hr/>
                            <p className="text-muted mb-0"><strong>Explanation:</strong> {res.explanation}</p>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
};

export default ChallengeResultPage;