import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import {
    FaTimes,
    FaMapMarkerAlt,
    FaStar,
    FaTrash,
    FaPen,
    FaCamera,
    FaChevronLeft,
    FaChevronRight,
    FaExpand
} from 'react-icons/fa';

import axios from 'axios';
import { toast } from 'react-hot-toast';

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const API_URL = import.meta.env.VITE_API_URL || "";

const TripDetails = ({ place, onClose, onUpdateMap, readOnly = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [displayPlace, setDisplayPlace] = useState(null);
    const [editData, setEditData] = useState({});
    const [existingImages, setExistingImages] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);

    const thumbnailsRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const startScrollLeft = useRef(0);

    // Gallery
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        if (place) {
            setDisplayPlace(place);
            resetEditState(place);
            setActiveImageIndex(0);
            setShowLightbox(false);
        }
    }, [place]);

    const resetEditState = (data) => {
        setIsEditing(false);

        setEditData({
            title: data.title,
            description: data.description,
            status: data.status,
            rating: data.rating || 5,
            visitDate: data.visitDate
                ? data.visitDate.split('T')[0]
                : ''
        });

        setExistingImages(data.images || []);
        setNewPhotos([]);
    };

    // =========================================
    // EDIT PHOTO FUNCTIONS
    // =========================================

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

        const mapped = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            caption: ''
        }));

        setNewPhotos([...newPhotos, ...mapped]);

        // Allows selecting the same file again
        e.target.value = '';
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

    // =========================================
    // GALLERY FUNCTIONS
    // =========================================

    const showPreviousImage = () => {
        if (!displayPlace?.images?.length) return;

        setActiveImageIndex((prev) =>
            prev === 0
                ? displayPlace.images.length - 1
                : prev - 1
        );
    };

    const showNextImage = () => {
        if (!displayPlace?.images?.length) return;

        setActiveImageIndex((prev) =>
            prev === displayPlace.images.length - 1
                ? 0
                : prev + 1
        );
    };

    const handleThumbnailMouseDown = (e) => {
        const slider = thumbnailsRef.current;
        if (!slider) return;

        isDragging.current = true;
        dragStartX.current = e.pageX;
        startScrollLeft.current = slider.scrollLeft;
    };

    const handleThumbnailMouseMove = (e) => {
        if (!isDragging.current) return;

        const slider = thumbnailsRef.current;
        if (!slider) return;

        const distance = e.pageX - dragStartX.current;
        slider.scrollLeft = startScrollLeft.current - distance;
    };

    const stopThumbnailDrag = () => {
        isDragging.current = false;
    };

    // Keyboard navigation for fullscreen viewer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showLightbox) return;
            if (e.key === "Escape") {
                setShowLightbox(false);
            }
            if (e.key === "ArrowLeft") {
                showPreviousImage();
            }
            if (e.key === "ArrowRight") {
                showNextImage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showLightbox, displayPlace]);

    useEffect(() => {
        if (!showLightbox) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [showLightbox]);

    // =========================================
    // UPDATE TRIP
    // =========================================

    const handleUpdate = async () => {
        setLoading(true);

        try {
            let newlyUploaded = [];

            if (newPhotos.length > 0) {
                const promises = newPhotos.map(async (p) => {
                    const formData = new FormData();

                    formData.append("file", p.file);
                    formData.append("upload_preset", UPLOAD_PRESET);

                    const res = await axios.post(
                        CLOUDINARY_URL,
                        formData
                    );

                    return {
                        url: res.data.secure_url,
                        caption: p.caption || ''
                    };
                });

                newlyUploaded = await Promise.all(promises);
            }

            const finalImages = [
                ...existingImages,
                ...newlyUploaded
            ];

            const payload = {
                ...editData,
                images: finalImages
            };

            if (payload.status === 'bucket-list') {
                payload.rating = null;
                payload.visitDate = null;
            }

            const res = await axios.put(
                `${API_URL}/api/places/${place._id}`,
                payload
            );

            setDisplayPlace(res.data);

            // Reset gallery to first image
            setActiveImageIndex(0);

            onUpdateMap();

            setLoading(false);
            setIsEditing(false);

            toast.success("Trip updated successfully!");

        } catch (err) {
            console.error(err);

            setLoading(false);

            toast.error("Failed to update trip.");
        }
    };

    // =========================================
    // DELETE TRIP
    // =========================================

    const handleDelete = async () => {
        if (window.confirm("Delete this trip?")) {
            try {
                await axios.delete(
                    `${API_URL}/api/places/${place._id}`
                );

                onUpdateMap();
                onClose();

                toast.success("Memory removed from your map.");

            } catch (err) {
                console.error(err);
                toast.error("Failed to delete trip.");
            }
        }
    };

    if (!displayPlace) return null;

    const hasHeroImage =
        displayPlace.images &&
        displayPlace.images.length > 0;

    const isBucketList =
        displayPlace.status === 'bucket-list';

    const activeImage =
        hasHeroImage
            ? displayPlace.images[activeImageIndex]
            : null;

    return (
        <div
            className={`tripdetail-panel view-tripdetail ${place ? 'open' : ''
                }`}
        >

            {/* =========================================
                CLOSE BUTTON
            ========================================= */}

            <button
                className="close-btn"
                onClick={onClose}
                style={{
                    zIndex: 3000,
                    position: 'absolute',
                    top: '20px',
                    right: '20px'
                }}
            >
                <FaTimes />
            </button>


            {/* =========================================
                HERO IMAGE
            ========================================= */}

            {!isEditing && hasHeroImage && (
                <img
                    src={displayPlace.images[0].url}
                    alt="hero"
                    className="hero-image"
                />
            )}


            <div
                className="content-pad"
                style={{
                    paddingTop:
                        (!isEditing && hasHeroImage)
                            ? '30px'
                            : '80px'
                }}
            >

                {/* =========================================
                    HEADER
                ========================================= */}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}
                >

                    <span
                        className={`badge ${isEditing
                            ? editData.status
                            : displayPlace.status
                            }`}
                    >
                        {
                            isEditing
                                ? editData.status === 'visited'
                                    ? 'Visited'
                                    : 'Bucket List'
                                : displayPlace.status === 'visited'
                                    ? 'Visited'
                                    : 'Bucket List'
                        }
                    </span>


                    <div
                        style={{
                            display: 'flex',
                            gap: '10px'
                        }}
                    >

                        {!readOnly && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                title="Edit"
                                className="icon-btn"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <FaPen />
                            </button>
                        )}

                        {!readOnly && (
                            <button
                                onClick={handleDelete}
                                title="Delete"
                                className="icon-btn"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    fontSize: '0.9rem',
                                    color: '#ff4757'
                                }}
                            >
                                <FaTrash />
                            </button>
                        )}

                    </div>

                </div>


                {/* =========================================
                    VIEW MODE
                ========================================= */}

                {!isEditing || readOnly ? (

                    <>

                        <h1 className="title-lg">
                            {displayPlace.title}
                        </h1>


                        {/* Rating + Date */}

                        {!isBucketList && (
                            <>
                                <div
                                    style={{
                                        color: '#F39C12',
                                        marginBottom: '10px'
                                    }}
                                >
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            color={
                                                i <
                                                    (displayPlace.rating || 0)
                                                    ? "#F39C12"
                                                    : "#E2E8F0"
                                            }
                                        />
                                    ))}
                                </div>


                                <div className="meta-row">
                                    <span>
                                        <FaMapMarkerAlt
                                            style={{
                                                marginRight: '5px',
                                                color: 'var(--accent-blue)'
                                            }}
                                        />

                                        {displayPlace.visitDate
                                            ? new Date(
                                                displayPlace.visitDate
                                            ).toLocaleDateString()
                                            : ''
                                        }
                                    </span>
                                </div>
                            </>
                        )}


                        {/* Description */}

                        {displayPlace.description && (
                            <p className="desc-text">
                                {displayPlace.description}
                            </p>
                        )}


                        {/* =========================================
                            PHOTO GALLERY
                        ========================================= */}

                        {!isBucketList && hasHeroImage && (
                            <div className="trip-gallery">

                                {/* Main image */}

                                <div
                                    className="gallery-main"
                                    onClick={() =>
                                        setShowLightbox(true)
                                    }
                                >

                                    <img
                                        src={activeImage.url}
                                        alt={
                                            activeImage.caption ||
                                            "Trip memory"
                                        }
                                    />


                                    {/* Expand button */}

                                    <button
                                        className="gallery-expand"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowLightbox(true);
                                        }}
                                    >
                                        <FaExpand />
                                    </button>


                                    {/* Previous / Next */}

                                    {displayPlace.images.length > 1 && (
                                        <>
                                            <button
                                                className="gallery-arrow gallery-prev"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showPreviousImage();
                                                }}
                                            >
                                                <FaChevronLeft />
                                            </button>

                                            <button
                                                className="gallery-arrow gallery-next"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showNextImage();
                                                }}
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </>
                                    )}

                                </div>


                                {/* Caption */}

                                {activeImage.caption && (
                                    <div className="gallery-caption">
                                        {activeImage.caption}
                                    </div>
                                )}


                                {/* Thumbnails */}

                                {displayPlace.images.length > 1 && (
                                    <div
                                        ref={thumbnailsRef}
                                        className="gallery-thumbnails"
                                        onMouseDown={handleThumbnailMouseDown}
                                        onMouseMove={handleThumbnailMouseMove}
                                        onMouseUp={stopThumbnailDrag}
                                        onMouseLeave={stopThumbnailDrag}
                                    >

                                        {displayPlace.images.map(
                                            (img, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`gallery-thumbnail ${idx === activeImageIndex
                                                        ? "active"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        setActiveImageIndex(idx)
                                                    }
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={`Memory ${idx + 1
                                                            }`}
                                                    />
                                                </button>
                                            )
                                        )}

                                    </div>
                                )}


                                {/* Image counter */}

                                {displayPlace.images.length > 1 && (
                                    <div className="gallery-counter">
                                        {activeImageIndex + 1}
                                        {" / "}
                                        {displayPlace.images.length}
                                    </div>
                                )}

                            </div>
                        )}

                    </>

                ) : (

                    /* =========================================
                       EDIT MODE
                    ========================================= */

                    <div
                        className="form-container"
                        style={{ padding: 0 }}
                    >

                        <div className="form-group">

                            <label>Title</label>

                            <input
                                type="text"
                                value={editData.title}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        title: e.target.value
                                    })
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>Status</label>

                            <select
                                value={editData.status}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        status: e.target.value
                                    })
                                }
                            >
                                <option value="visited">
                                    Visited
                                </option>

                                <option value="bucket-list">
                                    Bucket List
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>Story</label>

                            <textarea
                                rows="4"
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        description: e.target.value
                                    })
                                }
                            />

                        </div>


                        {editData.status === 'visited' && (
                            <>

                                {/* Date */}

                                <div className="form-group">

                                    <label>Date</label>

                                    <input
                                        type="date"
                                        value={editData.visitDate}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                visitDate: e.target.value
                                            })
                                        }
                                    />

                                </div>


                                {/* Rating */}

                                <div className="form-group">

                                    <label>Rating</label>

                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '5px'
                                        }}
                                    >

                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                size={24}
                                                color={
                                                    (i + 1) <= editData.rating
                                                        ? "#F39C12"
                                                        : "#E2E8F0"
                                                }
                                                onClick={() =>
                                                    setEditData({
                                                        ...editData,
                                                        rating: i + 1
                                                    })
                                                }
                                                style={{
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}

                                    </div>

                                </div>


                                {/* Manage photos */}

                                <div className="form-group">

                                    <label>
                                        Manage Photos
                                    </label>


                                    <div
                                        className="edit-image-grid"
                                        style={{
                                            flexDirection: 'column'
                                        }}
                                    >

                                        {/* Existing photos */}

                                        {existingImages.map(
                                            (img, idx) => (

                                                <div
                                                    key={`exist-${idx}`}
                                                    style={{
                                                        display: 'flex',
                                                        gap: '10px',
                                                        alignItems: 'center',
                                                        background: '#f9f9f9',
                                                        padding: '8px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #eee'
                                                    }}
                                                >

                                                    <div
                                                        className="edit-image-item"
                                                        style={{
                                                            flexShrink: 0
                                                        }}
                                                    >

                                                        <img
                                                            src={img.url}
                                                            alt="existing"
                                                        />

                                                        <button
                                                            className="btn-delete-img"
                                                            onClick={() =>
                                                                removeExistingImage(
                                                                    idx
                                                                )
                                                            }
                                                        >
                                                            ×
                                                        </button>

                                                    </div>


                                                    <input
                                                        type="text"
                                                        placeholder="Caption..."
                                                        value={
                                                            img.caption || ''
                                                        }
                                                        onChange={(e) =>
                                                            handleExistingCaptionChange(
                                                                idx,
                                                                e.target.value
                                                            )
                                                        }
                                                        style={{
                                                            padding: '8px',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    />

                                                </div>

                                            )
                                        )}


                                        {/* New photos */}

                                        {newPhotos.map(
                                            (p, idx) => (

                                                <div
                                                    key={`new-${idx}`}
                                                    style={{
                                                        display: 'flex',
                                                        gap: '10px',
                                                        alignItems: 'center',
                                                        background: '#eef2ff',
                                                        padding: '8px',
                                                        borderRadius: '12px',
                                                        border: '1px dashed var(--accent-blue)'
                                                    }}
                                                >

                                                    <div
                                                        className="edit-image-item"
                                                        style={{
                                                            flexShrink: 0
                                                        }}
                                                    >

                                                        <img
                                                            src={p.previewUrl}
                                                            alt="new"
                                                        />

                                                        <button
                                                            className="btn-delete-img"
                                                            onClick={() =>
                                                                removeNewPhoto(
                                                                    idx
                                                                )
                                                            }
                                                        >
                                                            ×
                                                        </button>

                                                    </div>


                                                    <input
                                                        type="text"
                                                        placeholder="Caption this new photo..."
                                                        value={p.caption}
                                                        onChange={(e) =>
                                                            handleNewCaptionChange(
                                                                idx,
                                                                e.target.value
                                                            )
                                                        }
                                                        style={{
                                                            padding: '8px',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    />

                                                </div>

                                            )
                                        )}

                                    </div>


                                    {/* Add photos */}

                                    <label
                                        className="photo-uploader"
                                        style={{
                                            padding: '10px'
                                        }}
                                    >

                                        <FaCamera />

                                        <span
                                            style={{
                                                marginLeft: '5px'
                                            }}
                                        >
                                            Add More Photos
                                        </span>

                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            hidden
                                            onChange={handleNewFileChange}
                                        />

                                    </label>

                                </div>

                            </>
                        )}


                        {/* Save */}

                        <button
                            className="btn-primary"
                            onClick={handleUpdate}
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Save Changes"
                            }
                        </button>


                        {/* Cancel */}

                        <button
                            onClick={() => setIsEditing(false)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginTop: '10px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            Cancel
                        </button>

                    </div>

                )}

            </div>


            {/* =========================================
                FULLSCREEN LIGHTBOX
            ========================================= */}

            {showLightbox && hasHeroImage && createPortal(
                <div
                    className="image-lightbox"
                    onClick={() => setShowLightbox(false)}
                >

                    {/* Close */}
                    <button
                        className="lightbox-close"
                        onClick={() => setShowLightbox(false)}
                    >
                        <FaTimes />
                    </button>


                    {/* Previous */}
                    {displayPlace.images.length > 1 && (
                        <button
                            className="lightbox-arrow lightbox-prev"
                            onClick={(e) => {
                                e.stopPropagation();
                                showPreviousImage();
                            }}
                        >
                            <FaChevronLeft />
                        </button>
                    )}


                    {/* Image */}
                    <div
                        className="lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={activeImage.url}
                            alt={activeImage.caption || "Trip memory"}
                        />

                        {activeImage.caption && (
                            <div className="lightbox-caption">
                                {activeImage.caption}
                            </div>
                        )}

                        <div className="lightbox-counter">
                            {activeImageIndex + 1} / {displayPlace.images.length}
                        </div>
                    </div>


                    {/* Next */}
                    {displayPlace.images.length > 1 && (
                        <button
                            className="lightbox-arrow lightbox-next"
                            onClick={(e) => {
                                e.stopPropagation();
                                showNextImage();
                            }}
                        >
                            <FaChevronRight />
                        </button>
                    )}

                </div>,
                document.body
            )}

        </div>
    );
};

export default TripDetails;