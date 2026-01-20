import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "./index.css";

export default function UpdatePassword({ onClose, currentUser }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/update-password", {
        username: currentUser,
        oldPassword,
        newPassword
      });
      alert("Password Updated!");
      onClose();
    } catch (err) {
      setMsg("Current password incorrect");
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
            <button className="btn-add" style={{width:'100%', justifyContent:'center'}}>Save Changes</button>
        </form>
        
        {msg && <div style={{textAlign:'center', marginTop:'10px', color:'#FF4757', fontSize:'0.9rem'}}>{msg}</div>}
        <FaTimes style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer'}} onClick={onClose} />
      </div>
    </div>
  );
}