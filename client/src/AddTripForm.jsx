import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaCamera, FaStar, FaMapPin } from 'react-icons/fa';

// KEEP YOUR CLOUDINARY CONSTANTS
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddzua6arv/image/upload";
const UPLOAD_PRESET = "triptale_preset";

const AddTripForm = ({ newLocation, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'visited',
    visitDate: new Date().toISOString().split('T')[0],
    rating: 5
  });
  
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Helper
  const isBucketList = formData.status === 'bucket-list';

  // File Handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: ''
    }));
    setPhotos([...photos, ...mapped]);
  };

  const handleCaptionChange = (index, text) => {
    const updated = [...photos];
    updated[index].caption = text;
    setPhotos(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let uploadedImages = [];
      if (!isBucketList && photos.length > 0) {
          const imagePromises = photos.map(async (photo) => {
            const data = new FormData();
            data.append("file", photo.file);
            data.append("upload_preset", UPLOAD_PRESET);
            const res = await axios.post(CLOUDINARY_URL, data);
            return { url: res.data.secure_url, caption: photo.caption };
          });
          uploadedImages = await Promise.all(imagePromises);
      }

      const payload = {
        ...formData,
        location: newLocation,
        images: uploadedImages,
        visitDate: isBucketList ? null : formData.visitDate,
        rating: isBucketList ? null : formData.rating
      };

      await axios.post('http://localhost:5000/api/places', payload);
      setUploading(false);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert("Error saving trip!");
    }
  };

  return (
    <div className={`sidebar-panel add-sidebar ${newLocation ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}><FaTimes /></button>
      
      <div className="form-container">
        <div className="form-header">
            {isBucketList ? "✈️ Dream Destination" : "📸 Add Memory"}
        </div>
        
        {/* NEW: Selected Location Info */}
        {newLocation && (
            <div style={{
                background: '#f0f2f5', padding: '10px 15px', borderRadius: '12px', marginBottom: '20px', 
                fontSize: '0.85rem', color: '#666', display:'flex', alignItems:'center', gap: '8px'
            }}>
                <FaMapPin color="#FF4757" />
                Selected: {newLocation.lat.toFixed(4)}, {newLocation.lng.toFixed(4)}
            </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Is this a dream or a memory?</label>
            <select className="status-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="visited">I Visited (Memory)</option>
              <option value="bucket-list">Bucket List (Dream)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location Name</label>
            <input 
              type="text" 
              placeholder={isBucketList ? "e.g. Northern Lights, Norway" : "e.g. Sushi in Tokyo"} 
              autoFocus
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required
            />
          </div>

          {!isBucketList && (
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date Visited</label>
                  <input type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Rating</label>
                    <div style={{ display: 'flex', gap: '5px', marginTop:'10px' }}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={20} cursor="pointer"
                                color={(i + 1) <= formData.rating ? "#FF9F1C" : "#E2E8F0"}
                                onClick={() => setFormData({ ...formData, rating: i + 1 })}
                            />
                        ))}
                    </div>
                </div>
              </div>
          )}

          <div className="form-group">
            <label>{isBucketList ? "Notes" : "The Experience"}</label>
            <textarea 
              rows="4" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required
            />
          </div>

          {!isBucketList && (
              <div className="form-group">
                <label>Gallery</label>
                <label className="photo-uploader">
                  <FaCamera size={24} />
                  <div style={{marginTop: '8px', fontWeight: 600}}>Add Photos</div>
                  <input type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
                </label>

                {photos.map((p, index) => (
                  <div key={index} className="preview-card">
                    <img src={p.previewUrl} className="preview-img" alt="" />
                    <input className="preview-input" type="text" placeholder="Caption..." value={p.caption} onChange={(e) => handleCaptionChange(index, e.target.value)} />
                  </div>
                ))}
              </div>
          )}

          <button type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? "Saving..." : isBucketList ? "Add to Dream List" : "Pin Memory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTripForm;