import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaLock, FaTrash, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "";

const Profile = ({ onClose, currentUser, setCurrentUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('general'); // general | security
    const [loading, setLoading] = useState(false);
    
    // User Data
    const [email] = useState(localStorage.getItem("user_email") || "No Email");
    const [newUsername, setNewUsername] = useState(currentUser || "");
    
    // Password Data
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });

    // 1. Update Username
    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userId = localStorage.getItem("user_id");
        try {
            const res = await axios.put(`${API_URL}/api/users/update-username`, { userId, newUsername });
            
            localStorage.setItem("user_name", res.data.username);
            setCurrentUser(res.data.username);
            toast.success("Username updated!");
        } catch (err) {
            toast.error("Failed to update username");
        } finally { setLoading(false); }
    };

    // 2. Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userId = localStorage.getItem("user_id");
        try {
            await axios.post(`${API_URL}/api/users/update-password`, {
                userId,
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            toast.success("Password changed successfully!");
            setPassData({ oldPassword: '', newPassword: '' });
        } catch (err) {
            toast.error(err.response?.data || "Error changing password");
        } finally { setLoading(false); }
    };

    // 3. Delete Account
    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? This deletes ALL your pins and photos permanently.")) return;
        setLoading(true);
        const userId = localStorage.getItem("user_id");
        try {
            await axios.delete(`${API_URL}/api/users/delete-account/${userId}`);
            toast.success("Account deleted. Safe travels!");
            onClose();
            onLogout();
        } catch (err) {
            toast.error("Failed to delete account");
            setLoading(false);
        }
    };

    return (
        <div className="loginContainer" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
            background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
            <div style={{
                width: '400px', background: 'white', borderRadius: '24px', 
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }}>
                {/* Header */}
                <div style={{padding: '20px 25px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:'40px', height:'40px', background:'#333', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}><FaUser /></div>
                        <div>
                            <h2 style={{margin: 0, fontSize: '1.2rem'}}>{currentUser}</h2>
                            <span style={{fontSize:'0.8rem', color:'#777'}}>{email}</span>
                        </div>
                    </div>
                    <FaTimes style={{cursor: 'pointer', fontSize: '1.2rem', color: '#888'}} onClick={onClose} />
                </div>

                {/* Tabs */}
                <div style={{display: 'flex', borderBottom: '1px solid #eee'}}>
                    <button onClick={() => setActiveTab('general')} style={{flex: 1, padding: '15px', background: activeTab === 'general' ? 'white' : '#f9f9f9', border: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'general' ? 'var(--primary)' : '#888', borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : 'none'}}>General</button>
                    <button onClick={() => setActiveTab('security')} style={{flex: 1, padding: '15px', background: activeTab === 'security' ? 'white' : '#f9f9f9', border: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'security' ? 'var(--primary)' : '#888', borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : 'none'}}>Security</button>
                </div>

                {/* Content */}
                <div style={{padding: '30px'}}>
                    
                    {activeTab === 'general' && (
                        <form onSubmit={handleUpdateUsername}>
                            <div className="form-group">
                                <label>Display Name</label>
                                <div style={{position: 'relative'}}>
                                    <FaUser style={{position: 'absolute', top: '15px', left: '15px', color: '#ccc'}} />
                                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{paddingLeft: '40px'}} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div style={{position: 'relative'}}>
                                    <FaEnvelope style={{position: 'absolute', top: '15px', left: '15px', color: '#ccc'}} />
                                    <input type="text" value={email} disabled style={{paddingLeft: '40px', color:'#999', cursor:'not-allowed'}} />
                                </div>
                            </div>
                            <button className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Update Profile"}</button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <>
                            <form onSubmit={handleChangePassword} style={{marginBottom:'30px'}}>
                                <div className="form-group">
                                    <label>Change Password</label>
                                    <div style={{position: 'relative', marginBottom:'10px'}}>
                                        <FaLock style={{position: 'absolute', top: '15px', left: '15px', color: '#ccc'}} />
                                        <input type="password" placeholder="Current Password" value={passData.oldPassword} onChange={(e) => setPassData({...passData, oldPassword: e.target.value})} style={{paddingLeft: '40px'}} />
                                    </div>
                                    <div style={{position: 'relative'}}>
                                        <FaLock style={{position: 'absolute', top: '15px', left: '15px', color: '#ccc'}} />
                                        <input type="password" placeholder="New Password" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} style={{paddingLeft: '40px'}} />
                                    </div>
                                </div>
                                <button className="btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
                            </form>

                            <div style={{borderTop:'1px solid #eee', paddingTop:'20px'}}>
                                <label style={{color:'#e74c3c'}}>Danger Zone</label>
                                <button type="button" onClick={handleDeleteAccount} style={{width: '100%', padding: '12px', background: '#fff0f0', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                                    <FaTrash /> Delete Account
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;