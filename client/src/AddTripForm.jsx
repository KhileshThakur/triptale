import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaCloudUploadAlt, FaCamera, FaStar } from 'react-icons/fa';

// REPLACE WITH YOUR CLOUDINARY DETAILS
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddzua6arv/image/upload";
const UPLOAD_PRESET = "triptale_preset";
const AddTripForm = ({ newLocation, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'visited',
    visitDate: new Date().toISOString().split('T')[0],
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState(5);
const [hover, setHover] = useState(null);

  // File Handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: ''
    }));
    setPhotos([...photos, ...newPhotos]);
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
      const imagePromises = photos.map(async (photo) => {
        const data = new FormData();
        data.append("file", photo.file);
        data.append("upload_preset", UPLOAD_PRESET);
        const res = await axios.post(CLOUDINARY_URL, data);
        return { url: res.data.secure_url, caption: photo.caption };
      });

      const uploadedImages = await Promise.all(imagePromises);

      const payload = {
        ...formData,
        location: newLocation,
        images: uploadedImages
      };

      await axios.post('http://localhost:5000/api/places', payload);
      setUploading(false);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert("Something went wrong!");
    }
  };

  return (
    <div className={`sidebar-panel add-sidebar ${newLocation ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}><FaTimes /></button>
      
      <div className="form-container">
        <div className="form-header">Add New Adventure</div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Where are we?</label>
            <input 
              type="text" 
              placeholder="e.g. The Louvre Museum" 
              autoFocus
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required
            />
          </div>
          <div className="form-group">
  <label>Rating</label>
  <div style={{ display: 'flex', gap: '5px' }}>
    {[...Array(5)].map((star, i) => {
      const ratingValue = i + 1;
      return (
        <label key={i} style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="rating" 
            value={ratingValue} 
            style={{ display: 'none' }} 
            onClick={() => setFormData({ ...formData, rating: ratingValue })}
          />
          <FaStar 
            size={24} 
            color={ratingValue <= (formData.rating || 5) ? "#FFB400" : "#e4e5e9"}
          />
        </label>
      );
    })}
  </div>
</div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Type</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="visited">I was here</option>
                <option value="bucket-list">I want to go</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>When?</label>
              <input type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>The Experience</label>
            <textarea 
              rows="4" 
              placeholder="Write about the sights, sounds, and feelings..." 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required
            />
          </div>

          <div className="form-group">
            <label>Memories Gallery</label>
            <label className="photo-uploader">
              <FaCamera size={24} />
              <div style={{marginTop: '8px', fontWeight: 500}}>Drop photos here</div>
              <div style={{fontSize: '0.8rem', opacity: 0.7}}>or click to browse</div>
              <input type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
            </label>

            {photos.map((p, index) => (
              <div key={index} className="preview-card">
                <img src={p.previewUrl} className="preview-img" alt="" />
                <input 
                  className="preview-input"
                  type="text" 
                  placeholder="Caption this moment..." 
                  value={p.caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? "Uploading Moments..." : "Create Pin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTripForm;