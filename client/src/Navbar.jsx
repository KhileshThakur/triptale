import React, { useState } from 'react';
import { FaSearch, FaLocationArrow, FaLayerGroup, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Navbar = ({ onSearch, onAddClick, onLocateClick, currentLayer, setLayer }) => {
  const [query, setQuery] = useState("");
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // State for Info Modal

  const handleSearch = (e) => {
    e.preventDefault();
    if(query) onSearch(query);
  };

  return (
    <>
      <nav className="floating-nav">
        <div className="logo">TripTale.</div>
        
        <form onSubmit={handleSearch} className="search-bar">
          <FaSearch color="#B2BEC3" />
          <input 
            type="text" 
            placeholder="Search places..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        
        <div className="nav-right">
            {/* Info Button */}
            <div className="icon-btn" onClick={() => setShowInfo(true)} title="How to use">
                <FaInfoCircle />
            </div>

            {/* Layer Switcher */}
            <div style={{position: 'relative'}}>
                <div 
                    className={`icon-btn ${showLayerMenu ? 'active' : ''}`} 
                    onClick={() => setShowLayerMenu(!showLayerMenu)}
                    title="Change Map Layer"
                >
                    <FaLayerGroup />
                </div>
                
                {showLayerMenu && (
                    <div style={{
                        position: 'absolute', top: '55px', right: 0, 
                        background: 'white', borderRadius: '12px', padding: '8px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '140px', display:'flex', flexDirection:'column', gap:'5px', zIndex: 2000
                    }}>
                        <button 
                            onClick={() => { setLayer('streets'); setShowLayerMenu(false); }}
                            style={{border:'none', background: currentLayer === 'streets' ? '#f0f0f0' : 'transparent', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontWeight:600}}
                        >
                            🗺️ Streets
                        </button>
                        <button 
                            onClick={() => { setLayer('satellite'); setShowLayerMenu(false); }}
                            style={{border:'none', background: currentLayer === 'satellite' ? '#f0f0f0' : 'transparent', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontWeight:600}}
                        >
                            🛰️ Satellite
                        </button>
                    </div>
                )}
            </div>

            <div className="icon-btn" onClick={onLocateClick} title="Locate Me">
                <FaLocationArrow />
            </div>
            
            <div className="btn-add" onClick={onAddClick}>
                <span>+ New Trip</span>
            </div>
        </div>
      </nav>

      {/* INSTRUCTIONS MODAL */}
      {showInfo && (
          <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <div style={{
                  background: 'white', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative'
              }}>
                  <button 
                    onClick={() => setShowInfo(false)}
                    style={{position:'absolute', top:'20px', right:'20px', border:'none', background:'transparent', fontSize:'1.2rem', cursor:'pointer'}}
                  >
                    <FaTimes />
                  </button>
                  
                  <h2 style={{marginTop:0, color:'#FF4757'}}>Welcome to TripTale! 🌍</h2>
                  <p style={{lineHeight: 1.6, color:'#555'}}>Your personal travel diary on a map.</p>
                  
                  <ul style={{paddingLeft: '20px', color:'#444', lineHeight: 2}}>
                      <li><strong>Double Click</strong> on map to add a new memory.</li>
                      <li><strong>Search</strong> to fly to a specific city.</li>
                      <li>Click <strong>Pins</strong> to view stories & photos.</li>
                      <li>Use the <strong>Edit Icon</strong> to update details.</li>
                  </ul>

                  <div style={{marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '12px', fontSize: '0.9rem'}}>
                      <strong>Legend:</strong><br/>
                      <span style={{color:'#00b894'}}>●</span> Visited &nbsp; 
                      <span style={{color:'#ffa502'}}>●</span> Bucket List &nbsp; 
                      <span style={{color:'#2e86de'}}>●</span> You
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Navbar;