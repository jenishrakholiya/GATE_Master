// File: frontend/src/pages/PracticeZonePage.js

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// This data should match the choices in your Django model
const subjects = [
    { code: 'MATH', name: 'Engineering Mathematics' },
    { code: 'DL', name: 'Digital Logic' },
    { code: 'COA', name: 'Computer Organization' },
    { code: 'PROG', name: 'Programming & Data Structures' },
    { code: 'ALGO', name: 'Algorithms' },
    { code: 'TOC', name: 'Theory of Computation' },
    { code: 'CD', name: 'Compiler Design' },
    { code: 'OS', name: 'Operating Systems' },
    { code: 'DB', name: 'Database Management' },
    { code: 'CN', name: 'Computer Networks' },
    { code: 'GA', name: 'General Aptitude' },
];

const PracticeZonePage = () => {
    return (
        <Container className="mt-4">
            <div className="p-4 mb-4 bg-light rounded-3">
                <h2>Practice Zone</h2>
                <p className="lead">
                    Select a subject to start a practice quiz. Each quiz consists of 20 randomly selected questions.
                </p>
            </div>
            <Row>
                {subjects.map((subject) => (
                    <Col md={4} lg={3} key={subject.code} className="mb-4">
                        <Card className="h-100 shadow-sm text-center">
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="flex-grow-1">{subject.name}</Card.Title>
                                <Button 
                                    as={Link} 
                                    to={`/practice/quiz/${subject.code}`} 
                                    variant="primary"
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