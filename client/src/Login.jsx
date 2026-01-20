import { useState, useRef } from "react";
import { FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import axios from "axios";
import "./index.css"; // Reuse your css

export default function Login({ setShowLogin, myStorage, setCurrentUser }) {
  const [error, setError] = useState(false);
  const nameRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      username: nameRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/users/login", user);
      myStorage.setItem("user", res.data.username);
      setCurrentUser(res.data.username);
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
          <input type="text" placeholder="Username" ref={nameRef} required />
          <input type="password" placeholder="Password" ref={passwordRef} required />
          <button className="btn-add" style={{width:'100%', justifyContent:'center', marginTop:'10px'}}>Login</button>
          
          {error && <span style={{color:'red', fontSize:'0.8rem', textAlign:'center'}}>Something went wrong!</span>}
        </form>
        
        <FaTimes 
            style={{position:'absolute', top:'20px', right:'20px', cursor:'pointer', color:'#aaa'}}
            onClick={() => setShowLogin(false)}
        />
      </div>
    </div>
  );
}