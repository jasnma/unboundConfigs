import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Zone {
    domain: string;
    forward_addr: string;
}

const ZoneList: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [newZone, setNewZone] = useState<Zone>({ domain: "", forward_addr: "" });
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const backend = window.location.hostname === 'localhost' ? "http://127.0.0.1:8000" : "";

    // 获取 Zones
    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await axios.get<Zone[]>(backend + "/api/zones/");
            setZones(response.data);
            setError(null);
        } catch (error) {
            setError("Failed to fetch zones");
        }
    };

    const isValidDomain = (domain: string): boolean => {
        // 检查域名是否有效
        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}\.?$/;
        return domainRegex.test(domain);
    };

    const isValidIPAddress = (ip: string) => {
        const ipWithPortRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(@\d+)?$/;
        return ipWithPortRegex.test(ip);
    };

    const handleAddZone = () => {
        if (!newZone.domain || !newZone.forward_addr) {
            setError("Both domain and forward address are required.");
            return;
        }
        if (!isValidDomain(newZone.domain)) {
            setError("Invalid domain format.");
            return;
        }
        if (!isValidIPAddress(newZone.forward_addr)) {
            setError("Invalid IP address format.");
            return;
        }
        setZones([...zones, newZone]);
        setNewZone({ domain: "", forward_addr: "" });
        setError(null);
    };

    const handleDeleteZone = (index: number) => {
        const updatedZones = zones.filter((_, i) => i !== index);
        setZones(updatedZones);
    };

    const handleEditZone = (index: number) => {
        setEditIndex(index);
        setNewZone(zones[index]);
    };

    const handleSaveEdit = () => {
        if (!newZone.domain || !newZone.forward_addr) {
            setError("Both domain and forward address are required.");
            return;
        }
        if (!isValidDomain(newZone.domain)) {
            setError("Invalid domain format.");
            return;
        }
        if (!isValidIPAddress(newZone.forward_addr)) {
            setError("Invalid IP address format.");
            return;
        }
        const updatedZones = zones.map((zone, index) =>
            index === editIndex ? newZone : zone
        );
        setZones(updatedZones);
        setEditIndex(null);
        setNewZone({ domain: "", forward_addr: "" });
        setError(null);
    };

    const handleUpdateZones = async () => {
        try {
            const response = await axios.post(backend + "/api/zones/update/", { zones });
            alert(response.data.message);
            fetchZones();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update zones.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h1>Custom Zones</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={() => handleUpdateZones()}>Update Zones</button>
            <table style={{ borderCollapse: 'collapse', width: '80%', margin: '20px 0', border: '1px solid black' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Domain</th>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Forward Address</th>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {zones.map((zone, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>{zone.domain}</td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>{zone.forward_addr}</td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                <button onClick={() => handleEditZone(index)}>Edit</button>
                                <button onClick={() => handleDeleteZone(index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <h2>{editIndex !== null ? "Edit Zone" : "Add Zone"}</h2>
                <input
                    type="text"
                    placeholder="Domain"
                    value={newZone.domain}
                    onChange={(e) => setNewZone({ ...newZone, domain: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Forward Address"
                    value={newZone.forward_addr}
                    onChange={(e) =>
                        setNewZone({ ...newZone, forward_addr: e.target.value })
                    }
                />
                {editIndex !== null ? (
                    <button onClick={handleSaveEdit}>Save</button>
                ) : (
                    <button onClick={handleAddZone}>Add</button>
                )}
            </div>
        </div>
    );
};

export default ZoneList;
