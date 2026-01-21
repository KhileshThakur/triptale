import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "./index.css";
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "";

export default function ForgotPassword({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/forgot-password`, { email });
      setStep(2);
      setMsg("OTP Sent!");
    } catch (err) { setMsg("User not found!"); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/reset-password`, { email, otp, newPassword });
      toast.success("Password reset successfully! You can now login.");
      onClose();
    } catch (err) { setMsg("Invalid OTP"); }
  };

  return (
    <div className="loginContainer" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
        background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div style={{width: '320px', padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative'}}>
        <h3 style={{textAlign:'center', marginTop:0}}>Reset Password</h3>
        
        {step === 1 ? (
            <form onSubmit={handleSendOtp} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <input type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} required />
                <button className="btn-add" style={{width:'100%', justifyContent:'center'}}>Send OTP</button>
            </form>
        ) : (
            <form onSubmit={handleReset} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <input type="text" placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} required />
                <input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
                <button className="btn-add" style={{width:'100%', justifyContent:'center'}}>Update Password</button>
            </form>
        )}
        
        {msg && <div style={{textAlign:'center', marginTop:'10px', color:'#FF4757', fontSize:'0.9rem'}}>{msg}</div>}
        <FaTimes style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer'}} onClick={onClose} />
      </div>
    </div>
  );
}