import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemManagement: React.FC = () => {
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const backend = window.location.hostname === 'localhost' ? "http://127.0.0.1:8000" : "";

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await axios.get(backend + "/api/unbound/status/");
            setStatus(response.data.status);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch Unbound status.");
        }
    };

    const handleStart = async () => {
        try {
            const response = await axios.post(backend + "/api/unbound/start/");
            alert(response.data.message);
            fetchStatus();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to start Unbound service.");
        }
    };

    const handleStop = async () => {
        try {
            const response = await axios.post(backend + "/api/unbound/stop/");
            alert(response.data.message);
            fetchStatus();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to stop Unbound service.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h1>System Management</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={handleStart}>Start Unbound</button>
            <button onClick={handleStop}>Stop Unbound</button>
            {status && <div>Server Status: {status}</div>}
        </div>
    );
};

export default SystemManagement;
