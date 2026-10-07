import React, { useState } from 'react';
import { FaSearch, FaLocationArrow, FaLayerGroup, FaInfoCircle, FaTimes, FaSignOutAlt, FaUser, FaUsers } from 'react-icons/fa';

const Navbar = ({ onSearch, onAddClick, onLocateClick, currentLayer, setLayer, currentUser, onLogout, onLoginClick, onRegisterClick, onProfileClick, onUsersClick }) => {
    const [query, setQuery] = useState("");
    const [showLayerMenu, setShowLayerMenu] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const handleSearch = (e) => { e.preventDefault(); if (query) onSearch(query); };

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

                    <div style={{ position: 'relative' }}>
                        <div className={`icon-btn ${showLayerMenu ? 'active' : ''}`} onClick={() => setShowLayerMenu(!showLayerMenu)} title="Change Map Layer"><FaLayerGroup /></div>
                        {showLayerMenu && (
                            <div style={{ position: 'absolute', top: '55px', right: 0, background: 'white', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '140px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 2000 }}>
                                <button onClick={() => { setLayer('streets'); setShowLayerMenu(false); }} style={{ border: 'none', background: currentLayer === 'streets' ? '#f0f0f0' : 'transparent', padding: '8px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>🗺️ Streets</button>
                                <button onClick={() => { setLayer('satellite'); setShowLayerMenu(false); }} style={{ border: 'none', background: currentLayer === 'satellite' ? '#f0f0f0' : 'transparent', padding: '8px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>🛰️ Satellite</button>
                            </div>
                        )}
                    </div>

                    <div className="icon-btn" onClick={onLocateClick} title="Locate Me"><FaLocationArrow /></div>

                    {currentUser ? (
                        <>
                            <div className="btn-add" onClick={onAddClick}><span>+ Add</span></div>
                            <div className="icon-btn" onClick={onProfileClick} title="My Profile"><FaUser /></div>
                            <div
                                className="icon-btn"
                                onClick={onUsersClick}
                                title="Explore Travelers"
                            >
                                <FaUsers />
                            </div>
                            <div className="icon-btn" onClick={onLogout} title="Logout" style={{ color: '#ff4757', borderColor: '#ff4757' }}><FaSignOutAlt /></div>
                        </>
                    ) : (
                        <>
                            <button onClick={onLoginClick} style={{ border: 'none', background: 'transparent', fontWeight: 700, cursor: 'pointer', color: '#555', marginLeft: '5px' }}>Login</button>
                            <div className="btn-add" onClick={onRegisterClick} style={{ width: 'auto', padding: '0 20px', background: '#333', boxShadow: 'none' }}>Join</div>
                        </>
                    )}
                </div>
            </nav>

            {showInfo && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(5px)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            width: "100%",
                            maxWidth: "390px",
                            borderRadius: "20px",
                            padding: "24px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                            position: "relative",
                        }}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setShowInfo(false)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                width: "32px",
                                height: "32px",
                                border: "none",
                                borderRadius: "50%",
                                background: "#f5f5f5",
                                color: "#555",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FaTimes />
                        </button>

                        {/* Header */}
                        <div style={{ marginBottom: "20px", paddingRight: "35px" }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "22px",
                                    fontWeight: "700",
                                    color: "#222",
                                }}
                            >
                                Quick Guide
                            </h2>

                            <p
                                style={{
                                    margin: "5px 0 0",
                                    fontSize: "13px",
                                    color: "#888",
                                }}
                            >
                                Everything you need to explore TripTale.
                            </p>
                        </div>

                        {/* Guide Items */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {/* Add memory */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{ fontSize: "20px" }}>📍</div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#222",
                                        }}
                                    >
                                        Add a memory
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "2px",
                                        }}
                                    >
                                        Double-click anywhere on the map to add your trip.
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{ fontSize: "20px" }}>🔎</div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#222",
                                        }}
                                    >
                                        Discover places
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "2px",
                                        }}
                                    >
                                        Search for cities, landmarks, or places.
                                    </div>
                                </div>
                            </div>

                            {/* Travelers */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    alignItems: "flex-start",
                                }}
                            >
                                <div style={{ fontSize: "20px" }}>👥</div>

                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#222",
                                        }}
                                    >
                                        Connect with travelers
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "2px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        Find people and explore their journeys.
                                    </div>

                                    {/* Connection flow */}
                                    <div
                                        style={{
                                            background: "#f8f8f8",
                                            borderRadius: "10px",
                                            padding: "8px 10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            fontSize: "11px",
                                            color: "#555",
                                        }}
                                    >
                                        <span>Travelers</span>
                                        <span>→</span>
                                        <span>Request</span>
                                        <span>→</span>
                                        <span>Gallery</span>
                                    </div>
                                </div>
                            </div>

                            {/* Explore gallery */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{ fontSize: "20px" }}>📸</div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#222",
                                        }}
                                    >
                                        Explore galleries
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "2px",
                                        }}
                                    >
                                        Once accepted, open their profile to see their trips.
                                    </div>
                                </div>
                            </div>

                            {/* View trips */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{ fontSize: "20px" }}>🗺️</div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#222",
                                        }}
                                    >
                                        Explore the map
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "2px",
                                        }}
                                    >
                                        Click a marker to see its story and photos.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div
                            style={{
                                marginTop: "20px",
                                paddingTop: "14px",
                                borderTop: "1px solid #eee",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    color: "#999",
                                    letterSpacing: "0.5px",
                                    marginBottom: "8px",
                                }}
                            >
                                MAP LEGEND
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "10px 16px",
                                    fontSize: "11px",
                                    color: "#666",
                                }}
                            >
                                <span>🟢 Visited</span>
                                <span>🟡 Bucket List</span>
                                <span>🔴 Search</span>
                                <span>🔵 You</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default Navbar;