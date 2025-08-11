// File: frontend/src/components/Timer.js

import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';

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
        <Badge bg={timeLeft < 300 ? "danger" : "primary"} pill className="ms-2" style={{ fontSize: '1rem', width: '70px' }}>
            {minutes.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </Badge>
    );
};

export default Timer;