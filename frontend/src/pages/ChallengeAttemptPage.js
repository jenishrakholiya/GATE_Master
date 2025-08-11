import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import Timer from '../components/Timer';

const getStatusColor = (status) => {
    switch (status) {
        case 'answered': return 'success';
        case 'notAnswered': return 'outline-danger';
        case 'review': return 'warning';
        case 'answeredReview': return 'primary';
        default: return 'outline-secondary';
    }
};

const ChallengeAttemptPage = () => {
    const { attemptId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [questions] = useState(() => location.state?.attemptData?.questions || []);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [statuses, setStatuses] = useState(() => {
        const initialStatuses = {};
        if (location.state?.attemptData?.questions) {
            location.state.attemptData.questions.forEach(q => {
                initialStatuses[q.id] = 'notVisited';
            });
        }
        return initialStatuses;
    });
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!location.state?.attemptData) {
            navigate('/challenges', { replace: true });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        const currentQuestionId = questions[currentQuestionIndex]?.id;
        if (currentQuestionId && statuses[currentQuestionId] === 'notVisited') {
            setStatuses(prev => ({ ...prev, [currentQuestionId]: 'notAnswered' }));
        }
    }, [currentQuestionIndex, questions, statuses]);

    const handleSubmit = useCallback(async () => {
        setShowSubmitModal(false);
        setIsSubmitting(true);
        const formattedAnswers = { ...answers };
        questions.forEach(q => {
            if (q.question_type === 'MSQ' && formattedAnswers[q.id]) {
                if (Array.isArray(formattedAnswers[q.id])) {
                    formattedAnswers[q.id] = formattedAnswers[q.id].sort().join('');
                }
            }
        });

        try {
            await axiosInstance.post('/challenges/submit/', { attempt_id: attemptId, answers: formattedAnswers });
            navigate(`/challenge/result/${attemptId}`);
        } catch (err) {
            alert('Failed to submit challenge. Please try again.');
            setIsSubmitting(false);
        }
    }, [answers, questions, attemptId, navigate]);

    const updateStatus = (questionId, newStatus) => {
        const currentStatus = statuses[questionId];
        if (newStatus === 'answered' && (currentStatus === 'review' || currentStatus === 'answeredReview')) {
            setStatuses(prev => ({ ...prev, [questionId]: 'answeredReview' }));
        } else {
            setStatuses(prev => ({ ...prev, [questionId]: newStatus }));
        }
    };
    
    const handleAnswerChange = (questionId, value, type) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (type === 'MSQ') {
                const currentAnswers = newAnswers[questionId] || [];
                if (currentAnswers.includes(value)) {
                    newAnswers[questionId] = currentAnswers.filter(ans => ans !== value);
                } else { newAnswers[questionId] = [...currentAnswers, value]; }
            } else { newAnswers[questionId] = value; }
            updateStatus(questionId, 'answered');
            return newAnswers;
        });
    };
    
    const renderInputs = (question) => {
        if (!question) return null; // Safety check
        switch (question.question_type) {
            case 'MCQ':
                return Object.entries(question.options).map(([key, value]) => (
                    <Form.Check key={key} type="radio" id={`q${question.id}-${key}`} label={`${key}: ${value}`} name={`q-${question.id}`} value={key} checked={answers[question.id] === key} onChange={(e) => handleAnswerChange(question.id, e.target.value, 'MCQ')} className="mb-3" />
                ));
            case 'MSQ':
                return Object.entries(question.options).map(([key, value]) => (
                    <Form.Check key={key} type="checkbox" id={`q${question.id}-${key}`} label={`${key}: ${value}`} name={`q-${question.id}`} value={key} checked={(answers[question.id] || []).includes(key)} onChange={(e) => handleAnswerChange(question.id, e.target.value, 'MSQ')} className="mb-3" />
                ));
            case 'NAT':
                return <Form.Control type="number" step="any" placeholder="Enter numerical answer" value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value, 'NAT')} style={{ maxWidth: '200px' }} />;
            default:
                return null;
        }
    };

    const handleSaveAndNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleMarkForReview = () => {
        const questionId = questions[currentQuestionIndex].id;
        const currentStatus = statuses[questionId];
        if (currentStatus === 'answered' || currentStatus === 'answeredReview') {
            setStatuses(prev => ({ ...prev, [questionId]: 'answeredReview' }));
        } else {
            setStatuses(prev => ({ ...prev, [questionId]: 'review' }));
        }
        handleSaveAndNext();
    };

    const handleClearResponse = () => {
        const questionId = questions[currentQuestionIndex].id;
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[questionId];
            return newAnswers;
        });
        setStatuses(prev => ({...prev, [questionId]: 'notAnswered'}));
    };

    if (questions.length === 0) {
        return <Container className="text-center mt-5"><Spinner animation="border" /><h3>Loading Challenge...</h3></Container>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <Container fluid className="mt-4">
            <Row>
                <Col md={9}>
                    <Card>
                        <Card.Header>
                            Question {currentQuestionIndex + 1}
                            <Badge bg="secondary" className="ms-2">{currentQuestion.question_type}</Badge>
                            <Badge bg="info" className="ms-2">{currentQuestion.marks} Mark(s)</Badge>
                        </Card.Header>
                        <Card.Body style={{ minHeight: '60vh', overflowY: 'auto' }}>
                            {currentQuestion.question_text && <p dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />}
                            {currentQuestion.question_image && <img src={currentQuestion.question_image} alt="Question figure" className="img-fluid" />}
                            <hr />
                            <Form>{renderInputs(currentQuestion)}</Form>
                        </Card.Body>
                        {/* --- THIS IS THE UPDATED FOOTER LOGIC --- */}
                        <Card.Footer>
                            <Button variant="warning" onClick={handleMarkForReview}>Mark for Review & Next</Button>
                            <Button variant="outline-danger" className="ms-2" onClick={handleClearResponse}>Clear Response</Button>
                            
                            <div className="float-end">
                                {currentQuestionIndex === questions.length - 1 ? (
                                    <Button variant="success" onClick={() => setShowSubmitModal(true)}>
                                        Finish & Submit Test
                                    </Button>
                                ) : (
                                    <Button variant="primary" onClick={handleSaveAndNext}>
                                        Save & Next
                                    </Button>
                                )}
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Header className="text-center d-flex justify-content-center align-items-center">
                            Time Left: <Timer seconds={3 * 60 * 60} onTimeUp={handleSubmit} />
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <h6>Question Palette</h6>
                            <div className="d-flex flex-wrap">
                                {questions.map((q, index) => (
                                    <Button
                                        key={q.id}
                                        variant={getStatusColor(statuses[q.id])}
                                        className={`m-1 p-0 d-flex align-items-center justify-content-center ${currentQuestionIndex === index ? 'border border-2 border-dark' : ''}`}
                                        style={{ width: '40px', height: '40px' }}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                            </div>
                        </Card.Body>
                        <Card.Footer className="text-center">
                            <Button variant="success" className="w-100" onClick={() => setShowSubmitModal(true)}>Submit Test</Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Confirm Submission</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to end the test and submit your answers?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : "Yes, Submit"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
export default ChallengeAttemptPage;