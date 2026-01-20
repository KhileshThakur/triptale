import React, { useState } from 'react';
import { FaTimes, FaMapMarkerAlt, FaStar, FaTrash, FaPen, FaSave } from 'react-icons/fa';
import axios from 'axios';

const Sidebar = ({ place, onClose, onUpdateMap }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing fields
  const [editData, setEditData] = useState({});

  // When opening a place, reset edit mode
  React.useEffect(() => {
    if (place) {
      setIsEditing(false);
      setEditData({
        title: place.title,
        description: place.description,
        status: place.status,
        rating: place.rating || 5,
        visitDate: place.visitDate ? place.visitDate.split('T')[0] : ''
      });
    }
  }, [place]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await axios.delete(`http://localhost:5000/api/places/${place._id}`);
        onUpdateMap();
        onClose();
      } catch (err) { console.error(err); }
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/places/${place._id}`, editData);
      onUpdateMap(); // Refresh map data
      setIsEditing(false); // Go back to view mode
      // Optional: Update local 'place' prop via a callback or parent refresh
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update");
    }
  };

  return (
    <div className={`sidebar-panel view-sidebar ${place ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}><FaTimes /></button>

      {place && (
        <>
          {/* HERO IMAGE (Always visible) */}
          {place.images.length > 0 && (
             <img src={place.images[0].url} alt="hero" className="hero-image" />
          )}

          <div className="content-pad">
            
            {/* --- HEADER ACTIONS (Edit/Delete) --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span className={`status-badge ${isEditing ? editData.status : place.status}`}>
                  {isEditing ? editData.status : place.status === 'visited' ? 'Visited' : 'Bucket List'}
                </span>
                
                <div style={{display:'flex', gap:'15px'}}>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} title="Edit" style={{background:'none', border:'none', cursor:'pointer', color:'#555'}}>
                            <FaPen />
                        </button>
                    )}
                    <button onClick={handleDelete} title="Delete" style={{background:'none', border:'none', cursor:'pointer', color:'#ff4444'}}>
                        <FaTrash />
                    </button>
                </div>
            </div>

            {/* --- VIEW MODE --- */}
            {!isEditing ? (
                <>
                    <h1 className="trip-title">{place.title}</h1>
                    <div style={{ color: '#FFB400', marginBottom: '10px' }}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} color={i < (place.rating || 5) ? "#FFB400" : "#e4e5e9"} />
                        ))}
                    </div>
                    <div className="trip-date">
                        <FaMapMarkerAlt style={{ marginRight: '5px' }}/>
                        {new Date(place.visitDate).toLocaleDateString()}
                    </div>
                    <p className="trip-desc">{place.description}</p>
                </>
            ) : (
                /* --- EDIT MODE --- */
                <div className="edit-form" style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <label>Title</label>
                    <input 
                        type="text" 
                        value={editData.title} 
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                    />
                    
                    <label>Story</label>
                    <textarea 
                        rows="4"
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                    />

                    <div style={{display:'flex', gap:'10px'}}>
                        <div style={{flex:1}}>
                            <label>Status</label>
                            <select value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                                <option value="visited">Visited</option>
                                <option value="bucket-list">Bucket List</option>
                            </select>
                        </div>
                        <div style={{flex:1}}>
                            <label>Date</label>
                            <input type="date" value={editData.visitDate} onChange={(e) => setEditData({...editData, visitDate: e.target.value})} />
                        </div>
                    </div>

                    <label>Rating</label>
                    <div style={{ display: 'flex', gap: '5px', marginBottom:'10px' }}>
                        {[...Array(5)].map((_, i) => {
                            const val = i + 1;
                            return (
                                <FaStar 
                                    key={i} 
                                    size={24} 
                                    style={{cursor:'pointer'}}
                                    color={val <= editData.rating ? "#FFB400" : "#e4e5e9"}
                                    onClick={() => setEditData({...editData, rating: val})}
                                />
                            );
                        })}
                    </div>

                    <button className="btn-primary" onClick={handleUpdate}>
                        <FaSave style={{marginRight:'8px'}}/> Save Changes
                    </button>
                </div>
            )}

            {/* PHOTOS (Read-only for now) */}
            {!isEditing && place.images.map((img, idx) => (
              <div key={idx} className="memory-card">
                <img src={img.url} alt="memory" />
                {img.caption && <div className="memory-caption">{img.caption}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;