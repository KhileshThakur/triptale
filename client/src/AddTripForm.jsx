import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaCamera, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Loader from './Loader';

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const API_URL = import.meta.env.VITE_API_URL || ""

const AddTripForm = ({ newLocation, onClose, onSaveSuccess }) => {
    const initialFormState = { title: '', description: '', status: 'visited', visitDate: new Date().toISOString().split('T')[0], rating: 5 };
    const [formData, setFormData] = useState(initialFormState);
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const isBucketList = formData.status === 'bucket-list';

    useEffect(() => { if (!newLocation) { setFormData(initialFormState); setPhotos([]); } }, [newLocation]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const mapped = files.map(file => ({ file, previewUrl: URL.createObjectURL(file), caption: '' }));
        setPhotos([...photos, ...mapped]);
    };

    const removePhoto = (indexToRemove) => {
        const updatedPhotos = [...photos];
        URL.revokeObjectURL(updatedPhotos[indexToRemove].previewUrl);
        updatedPhotos.splice(indexToRemove, 1);
        setPhotos(updatedPhotos);
    };

    const handleCaptionChange = (index, text) => {
        const updated = [...photos];
        updated[index].caption = text;
        setPhotos(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        // ✅ GET USER ID
        const currentUserId = localStorage.getItem("user_id");

        try {
            let uploadedImages = [];
            if (!isBucketList && photos.length > 0) {
                const imagePromises = photos.map(async (photo) => {
                    const data = new FormData();
                    data.append("file", photo.file);
                    data.append("upload_preset", UPLOAD_PRESET);
                    const res = await axios.post(CLOUDINARY_URL, data);
                    URL.revokeObjectURL(photo.previewUrl);
                    return { url: res.data.secure_url, caption: photo.caption };
                });
                uploadedImages = await Promise.all(imagePromises);
            }

            const payload = {
                userId: currentUserId, // ✅ SEND ID
                ...formData,
                location: newLocation,
                images: uploadedImages,
                visitDate: isBucketList ? null : formData.visitDate,
                rating: isBucketList ? null : formData.rating
            };

            await axios.post(`${API_URL}/api/places`, payload);

            setUploading(false);
            setFormData(initialFormState);
            setPhotos([]);
            onSaveSuccess();

        } catch (err) {
            console.error(err);
            setUploading(false);
            toast.error("Could not save your trip. Please try again.");
        }
    };

    const displayAddress = newLocation?.address ? newLocation.address : (newLocation ? `${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)}` : "Select a location");

    return (
        <div className={`tripdetail-panel add-tripdetail ${newLocation ? 'open' : ''}`}>
            {uploading && (<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <Loader text="Pinning memory..." fullScreen={false} /> </div>)}
            <button className="close-btn" onClick={onClose}><FaTimes /></button>

            <div className="form-container">
                <div className="form-header">{isBucketList ? "✈️ Dream Destination" : "📸 Add Memory"}</div>

                {newLocation && (
                    <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '16px', marginBottom: '25px', color: '#0d47a1', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #bbdefb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}> <FaMapMarkerAlt /> Selected Location </div>
                        <div style={{ lineHeight: 1.5, opacity: 0.9, fontSize: '0.95rem', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}> {displayAddress} </div>
                        {newLocation.address && (<div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}> {newLocation.lat.toFixed(5)}, {newLocation.lng.toFixed(5)} </div>)}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Is this a dream or a memory?</label>
                        <select className="status-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="visited">I Visited (Memory)</option>
                            <option value="bucket-list">Bucket List (Dream)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Location Name</label>
                        <input type="text" placeholder="e.g. Kyoto, Japan" autoFocus value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    {!isBucketList && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="form-group" style={{ flex: 1 }}> <label>Date Visited</label> <input type="date" value={formData.visitDate} onChange={e => setFormData({ ...formData, visitDate: e.target.value })} /> </div>
                            <div className="form-group" style={{ flex: 1 }}> <label>Rating</label> <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}> {[...Array(5)].map((_, i) => (<FaStar key={i} size={20} cursor="pointer" color={(i + 1) <= formData.rating ? "#FF9F1C" : "#E2E8F0"} onClick={() => setFormData({ ...formData, rating: i + 1 })} />))} </div> </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label>{isBucketList ? "Notes" : "The Experience"}</label>
                        <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                    {!isBucketList && (
                        <div className="form-group">
                            <label>Gallery</label>
                            <label className="photo-uploader"> <FaCamera size={24} /> <div style={{ marginTop: '8px', fontWeight: 600 }}>Add Photos</div> <input type="file" multiple accept="image/*" hidden onChange={handleFileChange} /> </label>
                            {photos.map((p, index) => (
                                <div key={index} className="preview-card">
                                    <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                                        <img src={p.previewUrl} className="preview-img" alt="" style={{ width: '100%', height: '100%' }} />
                                        <button type="button" onClick={() => removePhoto(index)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4757', color: 'white', border: '2px solid white', borderRadius: '50%', width: '22px', height: '22px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}> × </button>
                                    </div>
                                    <input className="preview-input" type="text" placeholder="Caption..." value={p.caption} onChange={(e) => handleCaptionChange(index, e.target.value)} />
                                </div>
                            ))}
                        </div>
                    )}
                    <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? "Saving..." : isBucketList ? "Add to Dream List" : "Pin Memory"}</button>
                </form>
            </div>
        </div>
    );
};
export default AddTripForm;