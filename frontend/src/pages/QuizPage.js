import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Form, Badge, ProgressBar, Modal } from 'react-bootstrap';
import { Lightbulb } from 'react-bootstrap-icons';
import axiosInstance from '../utils/axiosInstance';

// Timer component
const Timer = ({ seconds, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <Badge bg={timeLeft < 60 ? "danger" : "info"} pill className="ms-2" style={{ fontSize: '1rem' }}>
            {minutes.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </Badge>
    );
};

// Main Quiz Page Component
const QuizPage = () => {
    const { subject } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizState, setQuizState] = useState('loading'); // loading, ongoing, submitting, submitted, error
    const [results, setResults] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // State for "Show Answer" feature
    const [revealedAnswers, setRevealedAnswers] = useState(new Set());
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [revealedData, setRevealedData] = useState(null);

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
        try {
            const response = await axiosInstance.get(`/practice/question/${questionId}/answer/`);
            setRevealedData(response.data);
            setRevealedAnswers(prev => new Set(prev).add(questionId));
            setShowAnswerModal(true);
        } catch (err) { alert("Could not fetch the answer."); }
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

        return (
            <Container className="mt-4">
                <Card className="text-center shadow-sm mb-4">
                    <Card.Header>Quiz Complete!</Card.Header>
                    <Card.Body>
                        <Card.Title>Quiz Results</Card.Title>
                        {/* Display the score */}
                        <h1>{results.score} / {results.total_marks}</h1>
                        {/* NEW: Display the correct question count */}
                        <p className="lead">
                            You answered <strong>{results.correct_count}</strong> out of <strong>{attemptedQuestions}</strong> scored questions correctly.
                        </p>
                        {revealedCount > 0 && 
                            <p className="text-muted">({revealedCount} question(s) were revealed and not scored.)</p>
                        }
                        <Button variant="primary" onClick={() => navigate('/practice')}>Back to Practice Zone</Button>
                    </Card.Body>
                </Card>
                <h3>Review Your Answers</h3>
                {results.detailed_results.map((res, index) => (
                    <Card key={res.id} className={`mb-3 ${res.was_revealed ? 'border-warning' : (res.is_correct ? 'border-success' : 'border-danger')}`}>
                        <Card.Header>
                            Question {index + 1}
                            {res.was_revealed && <Badge bg="warning" className="ms-2">Answer Revealed</Badge>}
                        </Card.Header>
                        <Card.Body>
                            <p dangerouslySetInnerHTML={{ __html: `<strong>${res.question_text}</strong>` }}/>
                            <p className={res.is_correct ? 'text-success' : 'text-danger'}>
                                Your Answer: {Array.isArray(res.user_answer) ? res.user_answer.join(', ') : res.user_answer || 'Not Answered'}
                            </p>
                            {!res.is_correct && <p className="text-success">Correct Answer: {res.correct_answer}</p>}
                            <p className="text-muted"><em>Explanation: {res.explanation}</em></p>
                        </Card.Body>
                    </Card>
                ))}
            </Container>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isRevealed = revealedAnswers.has(currentQuestion?.id);
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
                    <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}>
                        Previous
                    </Button>
                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button variant="success" onClick={() => setShowConfirmModal(true)} disabled={quizState === 'submitting'}>
                            {quizState === 'submitting' ? <Spinner as="span" animation="border" size="sm" /> : 'Submit Quiz'}
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={() => setCurrentQuestionIndex(p => p + 1)}>
                            Next
                        </Button>
                    )}
                </Card.Footer>
            </Card>

            <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Answer & Explanation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Correct Answer: </strong>{revealedData?.correct_answer}</p>
                    <hr/>
                    <p><strong>Explanation: </strong>{revealedData?.explanation}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAnswerModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
            
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Submission</Modal.Title>
                </Modal.Header>
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