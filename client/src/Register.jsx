import { useState } from "react";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Register({ setShowRegister }) {
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // FIX: Use State instead of Refs to keep data alive between steps
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: ""
  });

  // Helper to update state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(false);
    setMsg("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/users/send-otp`, { email: formData.email, username: formData.username });
      setStep(2);
      setMsg("OTP sent to your email!");
    } catch (err) {
      setError(true);
      setMsg(err.response?.data || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      // Data is now safely pulled from state
      const newUser = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      };
      
await axios.post(`${API_URL}/api/users/register`, newUser);      
      alert("Registration Successful! Please Login.");
      setShowRegister(false); 

    } catch (err) {
      setError(true);
      setMsg("Invalid OTP or Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
        background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
          width: '320px', padding: '30px', background: 'white', 
          borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative'
      }}>
        <div style={{textAlign:'center', marginBottom:'20px'}}>
            <div className="logo" style={{justifyContent:'center'}}>TripTale.</div>
            <span style={{color:'#777'}}>Create Account</span>
        </div>

        {step === 1 ? (
            /* STEP 1: DETAILS */
            <form onSubmit={handleSendOtp} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <input 
                  type="text" name="username" placeholder="Username" 
                  value={formData.username} onChange={handleChange} required 
                />
                <input 
                  type="email" name="email" placeholder="Email" 
                  value={formData.email} onChange={handleChange} required 
                />
                <input 
                  type="password" name="password" placeholder="Password" 
                  value={formData.password} onChange={handleChange} required 
                />
                <button className="btn-add" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
                    {loading ? "Sending..." : "Next: Verify Email"}
                </button>
            </form>
        ) : (
            /* STEP 2: OTP */
            <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <div style={{textAlign:'center', fontSize:'0.9rem', color:'#555'}}>
                    Enter code sent to <br/><b>{formData.email}</b>
                </div>
                <input 
                  type="text" name="otp" placeholder="Enter 6-digit OTP" 
                  value={formData.otp} onChange={handleChange} required autoFocus 
                />
                
                <button className="btn-add" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Register"}
                </button>
                
                <div 
                    onClick={()=>setStep(1)} 
                    style={{fontSize:'0.8rem', color:'#FF4757', textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}
                >
                    <FaArrowLeft /> Back
                </div>
            </form>
        )}

        {(error || msg) && (
            <div style={{marginTop:'15px', textAlign:'center', color: error ? 'red' : 'green', fontSize:'0.85rem', fontWeight: 600}}>
                {msg}
            </div>
        )}
        
        <FaTimes 
            style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer', color:'#aaa'}} 
            onClick={() => setShowRegister(false)} 
        />
      </div>
    </div>
  );
}