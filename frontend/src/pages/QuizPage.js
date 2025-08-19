import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Form, Badge, ProgressBar, Modal, Row, Col, ListGroup, Accordion } from 'react-bootstrap';
import { Lightbulb, CheckCircleFill, XCircleFill, LightbulbFill } from 'react-bootstrap-icons';
import axiosInstance from '../utils/axiosInstance';
import ThemeContext from '../context/ThemeContext';
import Timer from '../components/Timer';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components needed for the Doughnut chart
ChartJS.register(ArcElement, Tooltip, Legend);

// Main Quiz Page Component
const QuizPage = () => {
    const { subject } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizState, setQuizState] = useState('loading');
    const [results, setResults] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [revealedAnswers, setRevealedAnswers] = useState(new Set());
    const [fetchedAnswers, setFetchedAnswers] = useState({}); 
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axiosInstance.get(`/practice/quiz/${subject}/`);
                if (response.data && response.data.length > 0) {
                    setQuestions(response.data);
                    setQuizState('ongoing');
                } else { setQuizState('error'); }
            } catch (err) { setQuizState('error'); }
        };
        fetchQuiz();
    }, [subject]);
    
    const handleRevealAnswer = async () => {
        const questionId = questions[currentQuestionIndex].id;
        if (fetchedAnswers[questionId]) {
            setShowAnswerModal(true);
        } else {
            try {
                const response = await axiosInstance.get(`/practice/question/${questionId}/answer/`);
                setFetchedAnswers(prev => ({ ...prev, [questionId]: response.data }));
                setRevealedAnswers(prev => new Set(prev).add(questionId));
                setShowAnswerModal(true);
            } catch (err) {
                alert("Could not fetch the answer. Please try again.");
            }
        }
    };

    const handleSubmit = useCallback(async () => {
        setShowConfirmModal(false);
        setQuizState('submitting');
        const formattedAnswers = { ...answers };
        questions.forEach(q => {
            if (q.question_type === 'MSQ' && formattedAnswers[q.id]) {
                formattedAnswers[q.id] = formattedAnswers[q.id].sort().join('');
            }
        });
        const allQuestionIds = questions.map(q => q.id);
        const revealedIds = Array.from(revealedAnswers);
        try {
            const response = await axiosInstance.post('/practice/submit/', {
                subject, answers: formattedAnswers, question_ids: allQuestionIds, revealed_ids: revealedIds
            });
            setResults(response.data);
            setQuizState('submitted');
        } catch (err) {
            alert('There was an error submitting your quiz.');
            setQuizState('ongoing');
        }
    }, [answers, questions, subject, revealedAnswers]);
    
    const handleAnswerChange = (questionId, value, type) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (type === 'MSQ') {
                const currentAnswers = newAnswers[questionId] || [];
                if (currentAnswers.includes(value)) {
                    newAnswers[questionId] = currentAnswers.filter(ans => ans !== value);
                } else {
                    newAnswers[questionId] = [...currentAnswers, value];
                }
            } else { newAnswers[questionId] = value; }
            return newAnswers;
        });
    };
    
    const renderInputs = (question) => {
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

    if (quizState === 'loading') {
        return <Container className="text-center mt-5"><Spinner animation="border" /><h3>Loading Quiz...</h3></Container>;
    }
    if (quizState === 'error') {
        return <Container className="mt-5"><Alert variant="danger">Could not load quiz. Please go back and try another subject.</Alert></Container>;
    }

    if (quizState === 'submitted' && results) {
        const revealedCount = results.detailed_results.filter(r => r.was_revealed).length;
        const attemptedQuestions = results.total_questions - revealedCount;
        const incorrectCount = attemptedQuestions - results.correct_count;
        const accuracy = results.total_marks > 0 ? Math.round((results.score / results.total_marks) * 100) : 0;
        
        const doughnutData = {
            labels: ['Correct', 'Incorrect'],
            datasets: [{
                data: [results.correct_count, incorrectCount],
                backgroundColor: ['#10B981', '#EF4444'],
                borderColor: ['var(--bs-card-bg)', 'var(--bs-card-bg)'],
                borderWidth: 2,
            }],
        };

        const textColor = theme === 'light' ? '#212121' : '#e8eaf6';

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'bottom', labels: { color: textColor } },
                title: { display: true, text: 'Question Breakdown', font: { size: 16 }, color: textColor },
            },
            cutout: '60%',
        };

        return (
            <Container className="mt-4">
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h4" className="text-center">Quiz Report</Card.Header>
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={4} style={{ height: '250px' }}>
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            </Col>
                            <Col md={8}>
                                <h2 className="text-center">Final Score: {results.score} / {results.total_marks}</h2>
                                <ListGroup variant="flush" className="mt-3">
                                    {/* --- UPDATED STATS BREAKDOWN --- */}
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <strong>Marks Gained:</strong> 
                                        <span className="text-success fw-bold">+{results.positive_marks}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <strong>Accuracy:</strong> 
                                        <Badge bg="primary" pill>{accuracy}%</Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <strong>Correct Answers:</strong> 
                                        <Badge bg="success" pill>{results.correct_count} / {attemptedQuestions}</Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <strong>Revealed / Forfeited:</strong> 
                                        <Badge bg="warning" text="dark" pill>{revealedCount}</Badge>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                    <Card.Footer className="text-center">
                        <Button variant="primary" onClick={() => navigate('/practice')}>Take Another Quiz</Button>
                    </Card.Footer>
                </Card>

                <h3 className="mt-5">Detailed Question Review</h3>
                {/* The Accordion for review remains unchanged */}
                <Accordion defaultActiveKey="0">
                    {results.detailed_results.map((res, index) => (
                         <Accordion.Item eventKey={index.toString()} key={res.id}>
                            <Accordion.Header>
                                <span className="fw-bold me-2">Question {index + 1}</span>
                                {res.was_revealed ? <LightbulbFill className="text-warning" /> : (res.is_correct ? <CheckCircleFill className="text-success" /> : <XCircleFill className="text-danger" />)}
                            </Accordion.Header>
                            <Accordion.Body>
                                <p dangerouslySetInnerHTML={{ __html: `<strong>${res.question_text}</strong>` }}/>
                                <p className={res.is_correct ? 'text-correct' : 'text-wrong'}>
                                    Your Answer: {Array.isArray(res.user_answer) ? res.user_answer.join(', ') : res.user_answer || 'Not Answered'}
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
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isRevealed = revealedAnswers.has(currentQuestion?.id);
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentAnswerData = fetchedAnswers[currentQuestion?.id];

    return (
        <Container className="mt-4" style={{ maxWidth: '800px' }}>
            <ProgressBar now={progress} label={`${currentQuestionIndex + 1}/${questions.length}`} className="mb-3" />
            <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4>Quiz: {subject}</h4>
                    <div>
                        <Button variant="outline-warning" size="sm" onClick={handleRevealAnswer} disabled={isRevealed}>
                            <Lightbulb /> Show Answer
                        </Button>
                        <Timer seconds={30 * 60} onTimeUp={handleSubmit} />
                    </div>
                </Card.Header>
                <Card.Body style={{ minHeight: '250px' }}>
                    <p className="text-muted">Question {currentQuestionIndex + 1} of {questions.length} ({currentQuestion.marks} Marks)</p>
                    {isRevealed && <Alert variant="warning">You have revealed the answer. This question will not be scored.</Alert>}
                    <Card.Title className="mb-4" dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />
                    <Form>{renderInputs(currentQuestion)}</Form>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}>Previous</Button>
                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button variant="success" onClick={() => setShowConfirmModal(true)} disabled={quizState === 'submitting'}>
                            {quizState === 'submitting' ? <Spinner as="span" animation="border" size="sm" /> : 'Submit Quiz'}
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={() => setCurrentQuestionIndex(p => p + 1)}>Next</Button>
                    )}
                </Card.Footer>
            </Card>

            <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Answer & Explanation</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p><strong>Correct Answer: </strong>{currentAnswerData?.correct_answer}</p><hr/>
                    <p><strong>Explanation: </strong>{currentAnswerData?.explanation}</p>
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowAnswerModal(false)}>Close</Button></Modal.Footer>
            </Modal>
            
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Confirm Submission</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to finish and submit your quiz?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default QuizPage;