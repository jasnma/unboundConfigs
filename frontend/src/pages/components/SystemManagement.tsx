import React, { useState } from 'react';
import axios from 'axios';

const SystemManagement: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const backend = window.location.hostname === 'localhost' ? "http://127.0.0.1:8000" : "";

    const handleStartUnbound = async () => {
        try {
            const response = await axios.post(backend + "/api/unbound/start/");
            setMessage(response.data.message);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to start Unbound service.");
            setMessage(null);
        }
    };

    const handleStopUnbound = async () => {
        try {
            const response = await axios.post(backend + "/api/unbound/stop/");
            setMessage(response.data.message);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to stop Unbound service.");
            setMessage(null);
        }
    };

    return (
        <div>
            <h1>系统管理</h1>
            {message && <div style={{ color: "green" }}>{message}</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={handleStartUnbound}>启动 Unbound 服务</button>
            <button onClick={handleStopUnbound}>停止 Unbound 服务</button>
        </div>
    );
};

export default SystemManagement;
