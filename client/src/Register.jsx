import { useEffect, useState } from "react";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "./index.css";
import Loader from './Loader';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Register({ setShowRegister }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [formData, setFormData] = useState({ username: "", name: "", email: "", password: "", otp: "" });


  useEffect(() => {
    const username = formData.username;

    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/users/check-username/${username}`
        );

        setUsernameStatus(
          response.data.available ? "available" : "taken"
        );
      } catch (err) {
        console.error("Username check failed:", err);
        setUsernameStatus("error");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "username") {
      value = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (usernameStatus !== "available") {
      setError(true);

      if (usernameStatus === "taken") {
        setMsg("Please choose a different username.");
      } else if (usernameStatus === "checking") {
        setMsg("Please wait while we check your username.");
      } else {
        setMsg("Please enter a valid username.");
      }

      return;
    }

    setError(false); setMsg(""); setLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/send-otp`, { email: formData.email, username: formData.username });
      setStep(2); setMsg("OTP sent to your email!");
    } catch (err) { setError(true); setMsg(err.response?.data || "Failed to send OTP"); }
    finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(false); setLoading(true);
    try {
      const newUser = { username: formData.username, name: formData.name, email: formData.email, password: formData.password, otp: formData.otp };
      await axios.post(`${API_URL}/api/users/register`, newUser);
      toast.success("Welcome aboard! Please login to continue.");
      setShowRegister(false);
    } catch (err) {
      setError(true);
      setMsg(err.response?.data || "Registration failed");
    }
    finally { setLoading(false); }
  };

  return (
    <div className="loginContainer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ width: '320px', padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
        {loading && (<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <Loader text={step === 1 ? "Sending OTP..." : "Verifying..."} fullScreen={false} /> </div>)}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}> <div className="logo" style={{ justifyContent: 'center' }}>TripTale.</div> <span style={{ color: '#777' }}>Create Account</span> </div>
        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                minLength={3}
                maxLength={20}
                required
              />

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "0.75rem",
                  minHeight: "18px",
                  textAlign: "left"
                }}
              >
                {formData.username.length < 3 && (
                  <span style={{ color: "#888" }}>
                    3–20 characters · lowercase letters, numbers, "_" or "-"
                  </span>
                )}

                {formData.username.length >= 3 &&
                  usernameStatus === "checking" && (
                    <span style={{ color: "#888" }}>
                      Checking username...
                    </span>
                  )}

                {usernameStatus === "available" && (
                  <span style={{ color: "#27ae60", fontWeight: 600 }}>
                    ✓ Username is available
                  </span>
                )}

                {usernameStatus === "taken" && (
                  <span style={{ color: "#e74c3c", fontWeight: 600 }}>
                    ✕ Username is already taken
                  </span>
                )}

                {usernameStatus === "error" && (
                  <span style={{ color: "#e67e22" }}>
                    Unable to check username. Please try again.
                  </span>
                )}
              </div>
            </div>
            <input type="text" name="name" placeholder="Full Name (optional)" value={formData.name} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button className="btn-add" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}> {loading ? "Sending..." : "Next: Verify Email"} </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#555' }}> Enter code sent to <br /><b>{formData.email}</b> </div>
            <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={formData.otp} onChange={handleChange} required autoFocus />
            <button className="btn-add" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}> {loading ? "Verifying..." : "Verify & Register"} </button>
            <div onClick={() => setStep(1)} style={{ fontSize: '0.8rem', color: '#FF4757', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}> <FaArrowLeft /> Back </div>
          </form>
        )}
        {(error || msg) && (<div style={{ marginTop: '15px', textAlign: 'center', color: error ? 'red' : 'green', fontSize: '0.85rem', fontWeight: 600 }}> {msg} </div>)}
        <FaTimes style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: '#aaa' }} onClick={() => setShowRegister(false)} />
      </div>
    </div>
  );
}
