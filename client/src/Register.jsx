import { useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "./index.css";

export default function Register({ setShowRegister }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = {
      username: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      await axios.post("http://localhost:5000/api/users/register", newUser);
      setSuccess(true);
      setError(false);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="registerContainer" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
        background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
          width: '320px', padding: '30px', background: 'white', 
          borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative'
      }}>
        <div style={{textAlign:'center', marginBottom:'20px'}}>
            <div className="logo" style={{justifyContent:'center', marginBottom:'10px'}}>TripTale.</div>
            <span style={{color:'#777'}}>Create your diary.</span>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input type="text" placeholder="Username" ref={nameRef} required />
          <input type="email" placeholder="Email" ref={emailRef} required />
          <input type="password" placeholder="Password" ref={passwordRef} required />
          <button className="btn-add" style={{width:'100%', justifyContent:'center', marginTop:'10px'}}>Register</button>
          
          {success && <span style={{color:'green', fontSize:'0.9rem', textAlign:'center'}}>Success! You can login now.</span>}
          {error && <span style={{color:'red', fontSize:'0.9rem', textAlign:'center'}}>Something went wrong!</span>}
        </form>
        
        <FaTimes 
            style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer', color:'#aaa'}}
            onClick={() => setShowRegister(false)}
        />
      </div>
    </div>
  );
}