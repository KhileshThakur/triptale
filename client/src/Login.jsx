import { useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login({ setShowLogin, myStorage, setCurrentUser, openForgot }) {
  const [error, setError] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userPayload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
    
      const res = await axios.post(`${API_URL}/api/users/login`, userPayload);

      // 1. Save Data (Token + Username)
      myStorage.setItem("user", res.data.username);
      myStorage.setItem("token", res.data.token); 
      setCurrentUser(res.data.username);
      
      // 2. Reset & Close
      setShowLogin(false);
      setError(false);
      
    } catch (err) {
      setError(true);
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
          borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          position: 'relative'
      }}>
        <div style={{textAlign:'center', marginBottom:'20px'}}>
            <div className="logo" style={{justifyContent:'center', marginBottom:'10px'}}>TripTale.</div>
            <span style={{color:'#777'}}>Welcome back!</span>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input type="email" placeholder="Email" ref={emailRef} required />
          <input type="password" placeholder="Password" ref={passwordRef} required />
          
          <div style={{textAlign:'right'}}>
            <span 
                onClick={() => { setShowLogin(false); openForgot(); }} 
                style={{fontSize:'0.8rem', color:'#FF4757', cursor:'pointer', fontWeight: 600}}
            >
                Forgot Password?
            </span>
          </div>

          <button className="btn-add" style={{width:'100%', justifyContent:'center', marginTop:'5px'}}>Login</button>
          
          {error && <span style={{color:'red', fontSize:'0.8rem', textAlign:'center'}}>Wrong email or password!</span>}
        </form>
        
        <FaTimes 
            style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer', color:'#aaa'}}
            onClick={() => setShowLogin(false)}
        />
      </div>
    </div>
  );
}