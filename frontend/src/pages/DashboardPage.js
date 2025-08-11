import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';

// Import Chart.js components (no changes here)
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Import new icons for the stat cards
import { TrophyFill, JournalCheck, Bullseye, ArrowRightCircleFill } from 'react-bootstrap-icons';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axiosInstance.get('/analytics/summary/');
                setAnalytics(response.data);
            } catch (err) {
                setError('Failed to fetch analytics data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <Container className="text-center mt-5"><Spinner animation="border" /><h3>Loading Your Dashboard...</h3></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }
    
    // --- NEW: Logic to find the weakest subject ---
    let focusSubject = null;
    if (analytics && analytics.subject_performance.length > 0) {
        // Find the subject with the minimum average accuracy
        focusSubject = analytics.subject_performance.reduce((min, p) => p.avg_accuracy < min.avg_accuracy ? p : min);
    }


    // Chart data and options (no changes)
    const abbreviations = {
        'General Aptitude': 'GA',
        'Engineering Mathematics': 'EM',
        'Theory of Computation': 'TOC',
        'Compiler Design': 'CD',
        'Operating Systems': 'OS',
        'Databases': 'DBMS',
        'Computer Networks': 'CN',
        'Digital Logic': 'DL',
        'Computer Organization and Architecture': 'COA',
        'Programming and Data Structures': 'PDS',
        'Algorithms': 'ALGO'
    };
    
    const chartData = {
        labels: analytics.subject_performance.map(
            p => abbreviations[p.subject_name] || p.subject_name
        ),
        datasets: [{
            label: 'Average Accuracy (%)',
            data: analytics.subject_performance.map(p => p.avg_accuracy),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Performance by Subject', font: { size: 18 } },
        },
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
    };

    return (
        <Container className="mt-4">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Welcome back, {user.username}!</h2>
                    <p className="lead text-muted">Here is your preparation summary. Let's get started!</p>
                </Col>
            </Row>

            {/* --- NEW: Redesigned Stat Cards --- */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm h-100">
                        <Card.Body className="d-flex align-items-center">
                            <JournalCheck color="royalblue" size={40} className="me-3" />
                            <div>
                                <h4 className="mb-0">{analytics.quizzes_taken}</h4>
                                <p className="text-muted mb-0">Quizzes Taken</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                     <Card className="shadow-sm h-100">
                        <Card.Body className="d-flex align-items-center">
                            <TrophyFill color="gold" size={40} className="me-3" />
                            <div>
                                <h4 className="mb-0">{analytics.overall_accuracy}%</h4>
                                <p className="text-muted mb-0">Overall Accuracy</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                {/* --- NEW: Smart "Focus Area" Card --- */}
                {focusSubject ? (
                    <Col md={4} className="mb-3">
                        <Card className="bg-info text-white shadow h-100">
                            <Card.Body className="d-flex align-items-center">
                                <Bullseye size={40} className="me-3" />
                                <div>
                                    <h5 className="mb-1">Focus Area</h5>
                                    <p className="mb-2">Your weakest subject is <strong>{focusSubject.subject_name}</strong>.</p>
                                    <Button as={Link} to={`/practice/quiz/${focusSubject.subject}`} variant="light" size="sm">
                                        Practice Now <ArrowRightCircleFill className="ms-1" />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    <Col md={4} className="mb-3">
                        <Card className="shadow-sm h-100">
                            <Card.Body className="d-flex align-items-center justify-content-center">
                                <p className="text-muted text-center mb-0">Take a few quizzes to identify your focus area!</p>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            <Row>
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Bar options={chartOptions} data={chartData} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header as="h5">Recent Activity</Card.Header>
                        {analytics.recent_activity.length > 0 ? (
                            <ListGroup variant="flush">
                                {analytics.recent_activity.map(act => (
                                    <ListGroup.Item key={act.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="fw-bold">{act.subject}</span><br/>
                                            <small className="text-muted">{new Date(act.timestamp).toLocaleDateString()}</small>
                                        </div>
                                        <Badge bg="primary" pill>{act.score}/{act.total_marks}</Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <Card.Body>
                                <p className="text-muted">No recent activity. Take a quiz to get started!</p>
                            </Card.Body>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;