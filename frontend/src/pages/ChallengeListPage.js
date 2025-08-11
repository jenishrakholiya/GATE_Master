// File: frontend/src/pages/ChallengeListPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Modal, Row, Col } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';

const ChallengeListPage = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await axiosInstance.get('/challenges/');
                setChallenges(response.data);
            } catch (err) {
                setError('Failed to load challenges.');
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    const handleStartClick = (challenge) => {
        setSelectedChallenge(challenge);
        setShowConfirmModal(true);
    };

    const handleStartChallenge = async () => {
        if (!selectedChallenge) return;
        setShowConfirmModal(false);
        try {
            const response = await axiosInstance.post('/challenges/start/', { challenge_id: selectedChallenge.id });
            // Navigate to the attempt page, passing the full attempt data in the state
            navigate(`/challenge/attempt/${response.data.id}`, { state: { attemptData: response.data } });
        } catch (err) {
            alert('Failed to start the challenge. Please try again.');
        }
    };

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <>
            <Container className="mt-4">
                <div className="p-4 mb-4 bg-light rounded-3">
                    <h2>Challenge Zone</h2>
                    <p className="lead text-muted">Test your knowledge with full-length, timed mock exams that simulate the real GATE experience.</p>
                </div>
                <Row>
                    {challenges.map(challenge => (
                        <Col md={6} lg={4} key={challenge.id} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title as="h4">{challenge.title}</Card.Title>
                                    <Card.Text className="text-muted flex-grow-1">{challenge.description}</Card.Text>
                                    <Button variant="success" onClick={() => handleStartClick(challenge)}>Start Challenge</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Challenge Start</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You are about to start the challenge: <strong>{selectedChallenge?.title}</strong></p>
                    <p className="text-danger">This is a 3-hour timed test. Make sure you are ready. You cannot pause the test once it begins.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleStartChallenge}>I'm Ready, Start Now</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ChallengeListPage;