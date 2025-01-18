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
    const [editZone, setEditZone] = useState<Zone>({ domain: "", forward_addr: "" });

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
        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/;
        return domainRegex.test(domain);
    };

    const isValidIPAddress = (ip: string) => {
        const ipWithPortRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(@\d+)?$/;
        return ipWithPortRegex.test(ip);
    };

    const handleEditZone = (index: number) => {
        setEditIndex(index);
        setEditZone(zones[index]);
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setEditZone({ domain: "", forward_addr: "" });
    };

    const handleSaveZone = (index: number) => {
        if (!isValidDomain(editZone.domain) || !isValidIPAddress(editZone.forward_addr)) {
            setError("Invalid domain or IP address.");
            return;
        }

        const updatedZones = [...zones];
        updatedZones[index] = editZone;
        setZones(updatedZones);
        setEditIndex(null);
        setError(null);
    };

    const handleDeleteZone = (index: number) => {
        const updatedZones = zones.filter((_, i) => i !== index);
        setZones(updatedZones);
        setError(null);
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
        const updatedZones = [...zones, newZone];
        setZones(updatedZones);
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
            <div>
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
                    onChange={(e) => setNewZone({ ...newZone, forward_addr: e.target.value })}
                />
                <button onClick={handleAddZone}>Add Zone</button>
            </div>
            <button onClick={handleUpdateZones}>Update Zones</button>
            <table style={{ borderCollapse: 'collapse', width: '80%', margin: '20px 0', border: '1px solid black', tableLayout: 'fixed' }}>
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
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        value={editZone.domain}
                                        onChange={(e) => setEditZone({ ...editZone, domain: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    zone.domain
                                )}
                            </td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        value={editZone.forward_addr}
                                        onChange={(e) => setEditZone({ ...editZone, forward_addr: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    zone.forward_addr
                                )}
                            </td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <>
                                        <button onClick={() => handleSaveZone(index)}>Save</button>
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditZone(index)}>Edit</button>
                                        <button onClick={() => handleDeleteZone(index)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ZoneList;
