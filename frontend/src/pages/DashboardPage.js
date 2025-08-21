import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import { TrophyFill, StarFill, Bullseye, ArrowRightCircleFill } from 'react-bootstrap-icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const abbreviations = {
    'General Aptitude': 'GA', 'Engineering Mathematics': 'Maths',
    'Theory of Computation': 'TOC', 'Compiler Design': 'CD',
    'Operating Systems': 'OS', 'Database Management Systems': 'DBMS',
    'Computer Networks': 'CN', 'Digital Logic': 'DL',
    'Computer Organization and Architecture': 'COA',
    'Programming and Data Structures': 'Prog & DS', 'Algorithms': 'Algo'
};

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

    const { focusSubject, bestSubject, chartConfig } = useMemo(() => {
        if (!analytics) return { focusSubject: null, bestSubject: null, chartConfig: null };

        const focus = analytics.subject_performance.length > 0
            ? analytics.subject_performance.reduce((min, p) => p.avg_accuracy < min.avg_accuracy ? p : min)
            : null;
        const best = analytics.subject_performance.length > 0
            ? analytics.subject_performance.reduce((max, p) => p.avg_accuracy > max.avg_accuracy ? p : max)
            : null;

        // Fixed colors for light mode only
        const textColor = '#212121';
        const gridColor = '#e0e0e0';
        const primaryColor = '#1a237e';
        const successColor = '#52B788';

        const config = {
            barChartData: {
                labels: analytics.subject_performance.map(p => abbreviations[p.subject_name] || p.subject_name),
                datasets: [{ 
                    label: 'Average Accuracy (%)', 
                    data: analytics.subject_performance.map(p => p.avg_accuracy), 
                    backgroundColor: primaryColor + 'B3', 
                    borderColor: primaryColor, 
                    borderWidth: 1 
                }],
            },
            barChartOptions: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Performance by Subject', font: { size: 18 }, color: textColor },
                },
                scales: {
                    y: { 
                        beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor },
                        title: { display: true, text: 'Average Accuracy (%)', color: textColor }
                    },
                    x: { 
                        grid: { color: gridColor }, ticks: { color: textColor },
                        title: { display: true, text: 'Subjects', color: textColor }
                    }
                }
            },
            lineChartData: {
                labels: analytics.recent_activity.map(a => new Date(a.timestamp).toLocaleDateString()).reverse(),
                datasets: [{ 
                    label: 'Quiz Accuracy (%)', 
                    data: analytics.recent_activity.map(a => a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0).reverse(), 
                    fill: true, 
                    borderColor: successColor, 
                    backgroundColor: successColor + '33', 
                    pointBackgroundColor: successColor, 
                    tension: 0.1 
                }]
            },
            lineChartOptions: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Performance Trend (Last 10 Quizzes)', font: { size: 18 }, color: textColor },
                },
                scales: {
                    y: { 
                        beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor },
                        title: { display: true, text: 'Quiz Accuracy (%)', color: textColor }
                    },
                    x: { 
                        grid: { color: gridColor }, ticks: { color: textColor },
                        title: { display: true, text: 'Date', color: textColor }
                    }
                }
            },
            doughnutData: {
                labels: analytics.subject_performance.map(p => abbreviations[p.subject_name] || p.subject_name),
                datasets: [{ 
                    data: analytics.subject_distribution.map(d => d.count), 
                    backgroundColor: ['#1a237e', '#5c6bc0', '#3B82F6', '#60A5FA', '#9fa8da', '#34D399', '#FBBF24', '#f57c00', '#42a5f5', '#ff7043', '#8d6e63'], 
                    borderWidth: 1, 
                    borderColor: '#fff'
                }]
            },
            doughnutOptions: { 
                responsive: true, 
                plugins: { 
                    legend: { display: true, position: 'right', labels: { color: textColor, boxWidth: 15 } }, 
                    title: { display: true, text: 'Practice Distribution', font: { size: 18 }, color: textColor } 
                } 
            },
            doughnutPlugins: [{
                beforeDraw: function(chart) {
                    const {width, height, ctx} = chart;
                    ctx.restore();
                    const fontSize = (height / 140).toFixed(2);
                    ctx.font = `bold ${fontSize}em sans-serif`;
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = textColor;
                    const text = `${analytics.quizzes_taken}`;
                    const text2 = "Quizzes";
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 2 - 10;
                    const text2X = Math.round((width - ctx.measureText(text2).width) / 2);
                    ctx.save();
                } 
            }]
        };
        return { focusSubject: focus, bestSubject: best, chartConfig: config };
    }, [analytics]);

    if (loading || !analytics) {
        return <Container className="text-center mt-5"><Spinner animation="border" /><h3>Loading Your Dashboard...</h3></Container>;
    }
    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="mt-4">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Welcome back, {user.username}!</h2>
                    <p className="lead text-muted">Here is your preparation summary. Let's get started!</p>
                </Col>
            </Row>
            
            {/* Stat Cards */}
            <Row className="mb-4">
                <Col sm={6} lg={3} className="mb-3">
                    <Card className="shadow-sm h-100">
                        <Card.Body className="d-flex align-items-center">
                            <TrophyFill size={40} className="me-3 text-warning" />
                            <div>
                                <h4 className="mb-0">{analytics.overall_accuracy}%</h4>
                                <p className="text-muted mb-0">Overall Accuracy</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                {bestSubject && (
                    <Col sm={6} lg={3} className="mb-3">
                        <Card className="shadow-sm h-100">
                            <Card.Body className="d-flex align-items-center">
                                <StarFill size={40} className="me-3 text-success" />
                                <div>
                                    <h5 className="mb-1">You Good in</h5>
                                    <p className="mb-0"><strong>{bestSubject.subject_name}</strong></p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                {focusSubject && (
                    <Col sm={6} lg={3} className="mb-3">
                        <Card className="shadow-sm h-100">
                            <Card.Body className="d-flex align-items-center">
                                <Bullseye size={40} className="me-3 text-danger" />
                                <div>
                                    <h5 className="mb-1">Focus Area</h5>
                                    <p className="mb-0"><strong>{focusSubject.subject_name}</strong></p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                <Col sm={6} lg={3} className="mb-3">
                    <Card as={Link} to="/practice" className="shadow-sm h-100 bg-primary text-white text-decoration-none">
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div className="text-center">
                                <ArrowRightCircleFill size={30} />
                                <h5 className="mt-2 mb-0">Start Practicing</h5>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Analytics Grid */}
            <Row>
                <Col lg={7} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body><Bar options={chartConfig.barChartOptions} data={chartConfig.barChartData} /></Card.Body>
                    </Card>
                </Col>
                <Col lg={5} className="mb-4">
                     <Card className="shadow-sm h-100">
                        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '320px' }}>
                            <div style={{ position: 'relative', height: '300px', width: '300px' }}>
                                <Doughnut data={chartConfig.doughnutData} options={chartConfig.doughnutOptions} plugins={chartConfig.doughnutPlugins} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={12} className="mb-4">
                    <Card className="shadow-sm h-100">
                         <Card.Body><Line options={chartConfig.lineChartOptions} data={chartConfig.lineChartData} /></Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;
