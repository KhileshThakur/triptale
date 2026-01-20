import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaStar, FaTrash, FaPen, FaCamera } from 'react-icons/fa';
import axios from 'axios';

// Constants
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const API_URL = import.meta.env.VITE_API_URL || ""; // Get from Env

const Sidebar = ({ place, onClose, onUpdateMap }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // displayPlace holds data so content remains visible during the "slide-out" animation
    const [displayPlace, setDisplayPlace] = useState(null);

    // --- EDIT STATE ---
    const [editData, setEditData] = useState({});
    const [existingImages, setExistingImages] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);

    // Initialize data when place prop changes
    useEffect(() => {
        if (place) {
            setDisplayPlace(place); // Update content
            resetEditState(place);
        }
        // Note: We DO NOT clear displayPlace when place is null 
        // This ensures the content stays there while the sidebar slides away
    }, [place]);

    const resetEditState = (data) => {
        setIsEditing(false);
        setEditData({
            title: data.title,
            description: data.description,
            status: data.status,
            rating: data.rating || 5,
            visitDate: data.visitDate ? data.visitDate.split('T')[0] : ''
        });
        setExistingImages(data.images || []);
        setNewPhotos([]);
    };

    // --- HANDLERS (Same as before) ---
    const handleExistingCaptionChange = (index, text) => {
        const updated = [...existingImages];
        updated[index].caption = text;
        setExistingImages(updated);
    };

    const handleNewCaptionChange = (index, text) => {
        const updated = [...newPhotos];
        updated[index].caption = text;
        setNewPhotos(updated);
    };

    const handleNewFileChange = (e) => {
        const files = Array.from(e.target.files);
        const mapped = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            caption: ''
        }));
        setNewPhotos([...newPhotos, ...mapped]);
    };

    const removeExistingImage = (index) => {
        const updated = [...existingImages];
        updated.splice(index, 1);
        setExistingImages(updated);
    };

    const removeNewPhoto = (index) => {
        const updated = [...newPhotos];
        updated.splice(index, 1);
        setNewPhotos(updated);
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            let newlyUploaded = [];
            if (newPhotos.length > 0) {
                const promises = newPhotos.map(async (p) => {
                    const formData = new FormData();
                    formData.append("file", p.file);
                    formData.append("upload_preset", UPLOAD_PRESET);
                    const res = await axios.post(CLOUDINARY_URL, formData);
                    return { url: res.data.secure_url, caption: p.caption || '' };
                });
                newlyUploaded = await Promise.all(promises);
            }

            const finalImages = [...existingImages, ...newlyUploaded];
            const payload = { ...editData, images: finalImages };

            if (payload.status === 'bucket-list') {
                payload.rating = null;
                payload.visitDate = null;
            }

            const res = await axios.put(`${API_URL}/api/places/${place._id}`, payload);
            setDisplayPlace(res.data);
            onUpdateMap();

            setLoading(false);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            alert("Update Failed");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this trip?")) {
            await axios.delete(`${API_URL}/api/places/${place._id}`);
            onUpdateMap();
            onClose();
        }
    }

    // --- RENDERING ---
    // Use 'place' for the OPEN class (so it slides out when null)
    // Use 'displayPlace' for the CONTENT (so it doesn't vanish instantly)

    if (!displayPlace) return null; // Safety check

    const hasHeroImage = displayPlace.images && displayPlace.images.length > 0;
    const isBucketList = displayPlace.status === 'bucket-list';

    return (
        <div className={`sidebar-panel view-sidebar ${place ? 'open' : ''}`}>

            {/* CLOSE BUTTON - Fixed position so it doesn't scroll away */}
            <button
                className="close-btn"
                onClick={onClose}
                style={{ zIndex: 3000, position: 'absolute', top: '20px', right: '20px' }}
            >
                <FaTimes />
            </button>

            {/* VIEW MODE HERO IMAGE */}
            {!isEditing && hasHeroImage && (
                <img src={displayPlace.images[0].url} alt="hero" className="hero-image" />
            )}

            {/* CONTENT PAD */}
            <div className="content-pad" style={{ paddingTop: (!isEditing && hasHeroImage) ? '30px' : '80px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span className={`badge ${isEditing ? editData.status : displayPlace.status}`}>
                        {isEditing ? editData.status : displayPlace.status === 'visited' ? 'Visited' : 'Bucket List'}
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!isEditing && <button onClick={() => setIsEditing(true)} title="Edit" className="icon-btn" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}><FaPen /></button>}
                        <button onClick={handleDelete} title="Delete" className="icon-btn" style={{ width: '36px', height: '36px', fontSize: '0.9rem', color: '#ff4757' }}><FaTrash /></button>
                    </div>
                </div>

                {!isEditing ? (
                    <>
                        <h1 className="title-lg">{displayPlace.title}</h1>
                        {!isBucketList && (
                            <>
                                <div style={{ color: '#F39C12', marginBottom: '10px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} color={i < (displayPlace.rating || 0) ? "#F39C12" : "#E2E8F0"} />
                                    ))}
                                </div>
                                <div className="meta-row">
                                    <span><FaMapMarkerAlt style={{ marginRight: '5px', color: 'var(--accent-blue)' }} /> {new Date(displayPlace.visitDate).toLocaleDateString()}</span>
                                </div>
                            </>
                        )}
                        <p className="desc-text">{displayPlace.description}</p>

                        {!isBucketList && displayPlace.images && displayPlace.images.map((img, idx) => (
                            <div key={idx} className="memory-card">
                                <img src={img.url} alt="memory" />
                                {img.caption && <div className="memory-caption">{img.caption}</div>}
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="form-container" style={{ padding: 0 }}>
                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                                <option value="visited">Visited</option>
                                <option value="bucket-list">Bucket List</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Story</label>
                            <textarea rows="4" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                        </div>
                        {editData.status === 'visited' && (
                            <>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" value={editData.visitDate} onChange={e => setEditData({ ...editData, visitDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Rating</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={24} color={(i + 1) <= editData.rating ? "#F39C12" : "#E2E8F0"} onClick={() => setEditData({ ...editData, rating: i + 1 })} style={{ cursor: 'pointer' }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Manage Photos</label>
                                    <div className="edit-image-grid" style={{ flexDirection: 'column' }}>
                                        {existingImages.map((img, idx) => (
                                            <div key={`exist-${idx}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f9f9f9', padding: '8px', borderRadius: '12px', border: '1px solid #eee' }}>
                                                <div className="edit-image-item" style={{ flexShrink: 0 }}>
                                                    <img src={img.url} alt="existing" />
                                                    <button className="btn-delete-img" onClick={() => removeExistingImage(idx)}>×</button>
                                                </div>
                                                <input
                                                    type="text" placeholder="Caption..." value={img.caption || ''}
                                                    onChange={(e) => handleExistingCaptionChange(idx, e.target.value)}
                                                    style={{ padding: '8px', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        ))}
                                        {newPhotos.map((p, idx) => (
                                            <div key={`new-${idx}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#eef2ff', padding: '8px', borderRadius: '12px', border: '1px dashed var(--accent-blue)' }}>
                                                <div className="edit-image-item" style={{ flexShrink: 0 }}>
                                                    <img src={p.previewUrl} alt="new" />
                                                    <button className="btn-delete-img" onClick={() => removeNewPhoto(idx)}>×</button>
                                                </div>
                                                <input
                                                    type="text" placeholder="Caption this new photo..." value={p.caption}
                                                    onChange={(e) => handleNewCaptionChange(idx, e.target.value)}
                                                    style={{ padding: '8px', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <label className="photo-uploader" style={{ padding: '10px' }}>
                                        <FaCamera /> <span style={{ marginLeft: '5px' }}>Add More Photos</span>
                                        <input type="file" multiple accept="image/*" hidden onChange={handleNewFileChange} />
                                    </label>
                                </div>
                            </>
                        )}
                        <button className="btn-primary" onClick={handleUpdate} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={() => setIsEditing(false)} style={{ width: '100%', padding: '10px', marginTop: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666' }}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;