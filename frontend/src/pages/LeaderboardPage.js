// File: frontend/src/pages/LeaderboardPage.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import { TrophyFill } from 'react-bootstrap-icons';

const LeaderboardPage = () => {
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext); // Get the current logged-in user

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axiosInstance.get('/leaderboard/');
                setLeaderboardData(response.data);
            } catch (err) {
                setError('Failed to load the leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    const { leaderboard, user_rank } = leaderboardData;

    return (
        <Container className="mt-4">
            {/* Card to show the current user's rank */}
            {user_rank ? (
                <Card className="user-rank-card mb-4 shadow-sm text-white">
                    <Card.Body className="d-flex justify-content-around align-items-center">
                        <div className="text-center">
                            <h5 className="mb-0">Your Rank</h5>
                            <h3 className="fw-bold">#{user_rank.rank}</h3>
                        </div>
                        <div className="vr" />
                        <div className="text-center">
                            <h5 className="mb-0">Your Best Score</h5>
                            <h3 className="fw-bold">{user_rank.score}</h3>
                        </div>
                    </Card.Body>
                </Card>
            ) : (
                 <Alert variant="info">
                    You don't have a rank yet. Complete a challenge in the Challenge Zone to appear on the leaderboard!
                </Alert>
            )}

            {/* Main leaderboard table */}
            <Card className="leaderboard-main-card shadow-sm">
                <Card.Header as="h5">Top 100 Rankings</Card.Header>
                <Table striped hover responsive className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Best Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map(entry => (
                            <tr key={entry.rank} className={user && entry.username === user.username ? 'current-user-row' : ''}>
                                <td><h4><Badge className={`rank-badge ${entry.rank === 1 ? 'rank-badge-gold' : entry.rank === 2 ? 'rank-badge-silver' : entry.rank === 3 ? 'rank-badge-bronze' : 'rank-badge-regular'}`} pill>{entry.rank}</Badge></h4></td>
                                <td className="fw-bold">{entry.username}</td>
                                <td className="fw-bold">{entry.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};

export default LeaderboardPage;