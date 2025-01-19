import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LocalData {
    domain: string;
    type: string;
    data: string;
}

const LocalDomain: React.FC = () => {
    const [localData, setLocalData] = useState<LocalData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [newData, setNewData] = useState<LocalData>({ domain: "", type: "", data: "" });
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editData, setEditData] = useState<LocalData>({ domain: "", type: "", data: "" });

    const backend = window.location.hostname === 'localhost' ? "http://127.0.0.1:8000" : "";

    useEffect(() => {
        fetchLocalData();
    }, []);

    const fetchLocalData = async () => {
        try {
            const response = await axios.get<LocalData[]>(backend + "/api/local-data/");
            setLocalData(response.data);
            setError(null);
        } catch (error) {
            setError("Failed to fetch local data");
        }
    };

    const handleEditData = (index: number) => {
        setEditIndex(index);
        setEditData(localData[index]);
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setEditData({ domain: "", type: "", data: "" });
    };

    const handleSaveData = (index: number) => {
        const updatedData = [...localData];
        updatedData[index] = editData;
        setLocalData(updatedData);
        setEditIndex(null);
        setError(null);
    };

    const handleDeleteData = (index: number) => {
        const updatedData = localData.filter((_, i) => i !== index);
        setLocalData(updatedData);
        setError(null);
    };

    const handleAddData = () => {
        if (!newData.domain || !newData.type || !newData.data) {
            setError("All fields are required.");
            return;
        }
        const updatedData = [...localData, newData];
        setLocalData(updatedData);
        setNewData({ domain: "", type: "", data: "" });
        setError(null);
    };

    const handleUpdateLocalData = async () => {
        try {
            const response = await axios.post(backend + "/api/local-data/update/", { local_data: localData });
            alert(response.data.message);
            fetchLocalData();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update local data.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h1>本地域名</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <div>
                <input
                    type="text"
                    placeholder="Domain"
                    value={newData.domain}
                    onChange={(e) => setNewData({ ...newData, domain: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Type"
                    value={newData.type}
                    onChange={(e) => setNewData({ ...newData, type: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Data"
                    value={newData.data}
                    onChange={(e) => setNewData({ ...newData, data: e.target.value })}
                />
                <button onClick={handleAddData}>Add Data</button>
            </div>
            <button onClick={handleUpdateLocalData}>Update Local Data</button>
            <table style={{ borderCollapse: 'collapse', width: '80%', margin: '20px 0', border: '1px solid black', tableLayout: 'fixed' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Domain</th>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Type</th>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Data</th>
                        <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {localData.map((data, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        value={editData.domain}
                                        onChange={(e) => setEditData({ ...editData, domain: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    data.domain
                                )}
                            </td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        value={editData.type}
                                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    data.type
                                )}
                            </td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        value={editData.data}
                                        onChange={(e) => setEditData({ ...editData, data: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    data.data
                                )}
                            </td>
                            <td style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>
                                {editIndex === index ? (
                                    <>
                                        <button onClick={() => handleSaveData(index)}>Save</button>
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditData(index)}>Edit</button>
                                        <button onClick={() => handleDeleteData(index)}>Delete</button>
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

export default LocalDomain;
