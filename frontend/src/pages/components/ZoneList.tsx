import React, { useState, useEffect } from "react";
import axios from "axios";

// 定义 Zone 类型
interface Zone {
    domain: string;
    forward_addr: string;
}

const ZoneList: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [newZone, setNewZone] = useState<Zone>({ domain: "", forward_addr: "" });
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const backend = "http://127.0.0.1:8000";

    // 获取 Zones
    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await axios.get<Zone[]>(backend + "/api/zones/?format=json");
            setZones(response.data);
            setError(null);
        } catch {
            setError("Failed to fetch zones.");
        }
    };

    const handleAddZone = () => {
        if (!newZone.domain || !newZone.forward_addr) {
            setError("Both domain and forward address are required.");
            return;
        }
        setZones([...zones, newZone]);
        setNewZone({ domain: "", forward_addr: "" });
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
        const updatedZones = zones.map((zone, index) =>
            index === editIndex ? newZone : zone
        );
        setZones(updatedZones);
        setEditIndex(null);
        setNewZone({ domain: "", forward_addr: "" });
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
        <div>
            <h1>Custom Zones</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <ul>
                {zones.map((zone, index) => (
                    <li key={index}>
                        {zone.domain} {"->"} {zone.forward_addr}{" "}
                        <button onClick={() => handleEditZone(index)}>Edit</button>
                        <button onClick={() => handleDeleteZone(index)}>Delete</button>
                    </li>
                ))}
            </ul>
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
            <button onClick={handleUpdateZones}>Update Zones</button>
        </div>
    );
};

export default ZoneList;
