// File: frontend/src/pages/MaterialZonePage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import { Download } from 'react-bootstrap-icons';

const subjects = [
    { code: 'ALL', name: 'All Subjects' },
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

const MaterialZonePage = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('ALL');

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                let url = '/materials/';
                if (selectedSubject !== 'ALL') {
                    url += `?subject=${selectedSubject}`;
                }
                const response = await axiosInstance.get(url);
                setMaterials(response.data);
            } catch (err) {
                setError('Failed to load materials. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [selectedSubject]);

    return (
        <Container className="mt-4">
            <div className="p-4 mb-4 page-header rounded-3">
                <h2>Material Zone</h2>
                <p className="lead text-muted">Browse and download subject-wise notes, formulas, and important PDFs.</p>
            </div>

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Form.Group as={Row} className="align-items-center">
                        <Form.Label column sm={2} className="fw-bold">Filter by Subject:</Form.Label>
                        <Col sm={10}>
                            <Form.Select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                {subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Card.Body>
            </Card>

            {loading && <div className="text-center p-5"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!loading && !error && (
                <Row>
                    {materials.length > 0 ? materials.map(material => (
                        <Col md={6} lg={4} key={material.id} className="mb-4">
                            <Card className="h-100 shadow-sm card-hover">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title as="h5">{material.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{material.subject_name}</Card.Subtitle>
                                    <Card.Text className="flex-grow-1">{material.description}</Card.Text>
                                    <Button href={material.file} target="_blank" download>
                                        <Download className="me-2" /> Download
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    )) : (
                        <Col>
                            <Alert variant="info">No materials found for the selected subject.</Alert>
                        </Col>
                    )}
                </Row>
            )}
        </Container>
    );
};

export default MaterialZonePage;