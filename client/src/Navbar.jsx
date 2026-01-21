import React, { useState } from 'react';
import { FaSearch, FaLocationArrow, FaLayerGroup, FaInfoCircle, FaTimes, FaSignOutAlt, FaUser, FaKey } from 'react-icons/fa';

const Navbar = ({ onSearch, onAddClick, onLocateClick, currentLayer, setLayer, currentUser, onLogout, onLoginClick, onRegisterClick , onUpdatePassClick}) => {
  const [query, setQuery] = useState("");
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleSearch = (e) => { e.preventDefault(); if(query) onSearch(query); };

  return (
    <>
      <nav className="floating-nav">
        <div className="logo">TripTale.</div>
        
        <form onSubmit={handleSearch} className="search-bar">
          <FaSearch color="#B2BEC3" />
          <input type="text" placeholder="Search places..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        
        <div className="nav-right">
            <div className="icon-btn" onClick={() => setShowInfo(true)} title="Guide"><FaInfoCircle /></div>

            <div style={{position: 'relative'}}>
                <div className={`icon-btn ${showLayerMenu ? 'active' : ''}`} onClick={() => setShowLayerMenu(!showLayerMenu)} title="Change Map Layer"><FaLayerGroup /></div>
                {showLayerMenu && (
                    <div style={{position: 'absolute', top: '55px', right: 0, background: 'white', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '140px', display:'flex', flexDirection:'column', gap:'5px', zIndex: 2000}}>
                        <button onClick={() => { setLayer('streets'); setShowLayerMenu(false); }} style={{border:'none', background: currentLayer === 'streets' ? '#f0f0f0' : 'transparent', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontWeight:600}}>🗺️ Streets</button>
                        <button onClick={() => { setLayer('satellite'); setShowLayerMenu(false); }} style={{border:'none', background: currentLayer === 'satellite' ? '#f0f0f0' : 'transparent', padding:'8px', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontWeight:600}}>🛰️ Satellite</button>
                    </div>
                )}
            </div>

            <div className="icon-btn" onClick={onLocateClick} title="Locate Me"><FaLocationArrow /></div>
            
            {/* CHECK: currentUser will be the Name string "Khilesh", so this is True */}
            {currentUser ? (
                <>
                    <div className="btn-add" onClick={onAddClick}><span>+ Add</span></div>
                    <div className="icon-btn" onClick={onUpdatePassClick} title="Change Password"><FaKey /></div>
                    <div className="icon-btn" onClick={onLogout} title="Logout" style={{color:'#ff4757', borderColor:'#ff4757'}}><FaSignOutAlt /></div>
                </>
            ) : (
                <>
                    <button onClick={onLoginClick} style={{border:'none', background:'transparent', fontWeight:700, cursor:'pointer', color:'#555', marginLeft:'5px'}}>Login</button>
                    <div className="btn-add" onClick={onRegisterClick} style={{width:'auto', padding:'0 20px', background:'#333', boxShadow:'none'}}>Join</div>
                </>
            )}
        </div>
      </nav>

      {showInfo && (
          <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{background: 'white', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative'}}>
                  <button onClick={() => setShowInfo(false)} style={{position:'absolute', top:'20px', right:'20px', border:'none', background:'transparent', fontSize:'1.2rem', cursor:'pointer'}}><FaTimes /></button>
                  <h2 style={{marginTop:0, color:'#FF4757', display:'flex', alignItems:'center', gap:'10px'}}><FaInfoCircle /> Guide</h2>
                  <div style={{display:'flex', flexDirection:'column', gap:'15px', color:'#444', lineHeight: 1.5, fontSize:'0.95rem'}}>
                      <div>👆 <strong>Add Trip:</strong> Double-click anywhere on the map to pin a new memory or bucket list item (Login required).</div>
                      <div>🔍 <strong>Find:</strong> Use the search bar to fly to a specific city or landmark.</div>
                      <div>👀 <strong>View:</strong> Click any pin to read your story and see photos.</div>
                      <div>✏️ <strong>Manage:</strong> Click the <strong>Pen</strong> icon to Edit or the <strong>Trash</strong> icon to Delete a trip.</div>
                  </div>
                  <div style={{marginTop: '25px', padding: '15px', background: '#f9f9f9', borderRadius: '12px', fontSize: '0.85rem'}}>
                      <strong style={{display:'block', marginBottom:'10px', textTransform:'uppercase', color:'#888', fontSize:'0.75rem'}}>Map Legend</strong>
                      <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'10px'}}>
                          <div style={{display:'flex', alignItems:'center', gap:'8px'}}><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" height="20" alt=""/> Visited</div>
                          <div style={{display:'flex', alignItems:'center', gap:'8px'}}><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" height="20" alt=""/> Bucket List</div>
                          <div style={{display:'flex', alignItems:'center', gap:'8px'}}><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" height="20" alt=""/> Search</div>
                          <div style={{display:'flex', alignItems:'center', gap:'8px'}}><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" height="20" alt=""/> You</div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};
export default Navbar;