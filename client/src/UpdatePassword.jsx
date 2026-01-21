import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "./index.css";
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "";

// Removed 'currentUser' prop, fetching ID from storage
export default function UpdatePassword({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const userId = localStorage.getItem("user_id"); // ✅ GET ID

    try {
      await axios.post(`${API_URL}/api/users/update-password`, {
        userId: userId, // ✅ SEND ID
        oldPassword,
        newPassword
      });
      toast.success("Security updated! Your password has been changed.");
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data || "Current password incorrect");
    }
  };

  return (
    <div className="loginContainer" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
        background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div style={{width: '320px', padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative'}}>
        <h3 style={{textAlign:'center', marginTop:0}}>Change Password</h3>
        
        <form onSubmit={handleUpdate} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            <input type="password" placeholder="Current Password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            <button className="btn-add" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
            </button>
        </form>
        
        <FaTimes style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer'}} onClick={onClose} />
      </div>
    </div>
  );
}