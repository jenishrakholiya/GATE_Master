import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// Importing icons
import { Calculator, Diagram3, Cpu, CodeSlash, MortarboardFill, Book, Braces, Files, HddStack, Wifi, People } from 'react-bootstrap-icons';

const subjects = [
    { code: 'MATH', name: 'Engineering Mathematics', icon: <Calculator size={30} /> },
    { code: 'DL', name: 'Digital Logic', icon: <Diagram3 size={30} /> },
    { code: 'COA', name: 'Computer Organization', icon: <Cpu size={30} /> },
    { code: 'PROG', name: 'Programming & Data Structures', icon: <CodeSlash size={30} /> },
    { code: 'ALGO', name: 'Algorithms', icon: <Braces size={30} /> },
    { code: 'TOC', name: 'Theory of Computation', icon: <Book size={30} /> },
    { code: 'CD', name: 'Compiler Design', icon: <MortarboardFill size={30} /> },
    { code: 'OS', name: 'Operating Systems', icon: <Files size={30} /> },
    { code: 'DB', name: 'Database Management', icon: <HddStack size={30} /> },
    { code: 'CN', name: 'Computer Networks', icon: <Wifi size={30} /> },
    { code: 'GA', name: 'General Aptitude', icon: <People size={30} /> },
];

const PracticeZonePage = () => {
    return (
        <Container className="mt-4">
            <div className="p-4 mb-4 bg-light rounded-3">
                <h2>Practice Zone</h2>
                <p className="lead text-muted">
                    Select a subject to start a practice quiz. Each quiz consists of 20 randomly selected questions.
                </p>
            </div>
            <Row>
                {subjects.map((subject) => (
                    <Col md={6} lg={4} key={subject.code} className="mb-4">
                        <Card className="h-100 shadow-sm text-center card-hover">
                            <Card.Body className="d-flex flex-column p-4">
                                <div className="text-primary mb-3">{subject.icon}</div>
                                <Card.Title as="h5" className="flex-grow-1">{subject.name}</Card.Title>
                                {/* The progress bar and its wrapper div have been removed */}
                                <Button 
                                    as={Link} 
                                    to={`/practice/quiz/${subject.code}`} 
                                    variant="primary"
                                    className="w-100 mt-auto" // mt-auto pushes the button to the bottom
                                >
                                    Start Quiz
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PracticeZonePage;