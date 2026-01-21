import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { Toaster, toast } from 'react-hot-toast';

// Import Sub-Components
import TripDetails from './TripDetails';
import AddTripForm from './AddTripForm';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import Loader from './Loader';
import Profile from './Profile';

const API_URL = import.meta.env.VITE_API_URL || "";

// ==========================================
// 1. CUSTOM MARKERS & CONFIG (Kept same)
// ==========================================
const iconConfig = { iconSize: [20, 32], iconAnchor: [10, 32], popupAnchor: [0, -32], tooltipAnchor: [0, -32], shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [28, 28], shadowAnchor: [8, 28] };
const visitedIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' });
const bucketIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png' });
const searchIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' });
const currentLocationIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png' });

const StatsWidget = ({ places }) => {
  // State to control collapse/expand
  const [isExpanded, setIsExpanded] = useState(false);

  const visitedCount = places.filter(p => p.status === 'visited').length;
  const bucketCount = places.filter(p => p.status === 'bucket-list').length;

  const LegendRow = ({ label, iconUrl }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
        <img src={iconUrl} alt="pin" style={{ height: '24px' }} />
      </div>
      <span style={{ fontSize: '0.8rem', color: '#555', fontWeight: 600 }}>{label}</span>
    </div>
  );

  return (
    <div className={`stats-widget ${isExpanded ? 'expanded' : ''}`}>
      
      {/* 1. TOGGLE BUTTON (Visible on Mobile) */}
      <div 
        className="widget-toggle" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
        <span style={{marginLeft:'5px', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase'}}>
            {isExpanded ? 'Hide Legend' : 'Legend'}
        </span>
      </div>

      {/* 2. LEGEND SECTION (Collapsible) */}
      <div className="widget-legend">
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Map Legend</h4>
        <LegendRow label="Visited" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" />
        <LegendRow label="Bucket List" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" />
        <LegendRow label="Search Result" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" />
        <LegendRow label="Your Location" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" />
      </div>

      {/* 3. COUNTERS SECTION (Always Visible) */}
      <div className="widget-counters">
        <div className="stat-item border-right">
          <span className="stat-num" style={{color: '#2ecc71'}}>{visitedCount}</span>
          <span className="stat-label">Visited</span>
        </div>
        <div className="stat-item">
          <span className="stat-num" style={{color: '#f1c40f'}}>{bucketCount}</span>
          <span className="stat-label">Bucket List</span>
        </div>
      </div>
    </div>
  );
};

const MapController = ({ searchResult, userLocation, triggerLocate, setTriggerLocate, onUserLocationFound }) => {
  const map = useMap();
  useEffect(() => { if (searchResult) map.flyTo([searchResult.lat, searchResult.lng], 14, { animate: true, duration: 1.5 }); }, [searchResult, map]);
  useEffect(() => { if (userLocation) map.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true, duration: 1.5 }); }, [userLocation, map]);
  useEffect(() => { if (triggerLocate) { map.locate(); setTriggerLocate(false); } }, [triggerLocate, map, setTriggerLocate]);
  useMapEvents({ locationfound(e) { onUserLocationFound(e.latlng); map.flyTo(e.latlng, 13, { animate: true }); }, });
  return null;
};

// --- HANDLER: Checks currentUserId before adding pins ---
function MapEventsHandler({ setNewLocation, setSelectedPlace, currentUserId }) {
  useMapEvents({
    dblclick: async (e) => {
      // ✅ CHECK ID INSTEAD OF NAME
      if (!currentUserId) {
        toast.error("Please login to add a trip!");
        return;
      }
      const { lat, lng } = e.latlng;
      setNewLocation({ lat, lng, address: "Locating..." });
      setSelectedPlace(null);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
        const data = res.data;
        let finalAddress = "";
        if (data.display_name) { finalAddress = data.display_name; }
        else if (data.address) { const { city, town, village, country } = data.address; finalAddress = [city || town || village, country].filter(Boolean).join(", "); }
        setNewLocation({ lat, lng, address: finalAddress || "Address not found" });
      } catch (err) {
        console.error("Geocoding Error:", err);
        setNewLocation({ lat, lng, address: "Unknown Location" });
      }
    },
  });
  return null;
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
function App() {
  const myStorage = window.localStorage;

  // ✅ STATE: Load ID and Name separately
  const [currentUserId, setCurrentUserId] = useState(myStorage.getItem("user_id"));
  const [currentUserName, setCurrentUserName] = useState(myStorage.getItem("user_name"));

  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [places, setPlaces] = useState([]);
  const [newLocation, setNewLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [triggerLocate, setTriggerLocate] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('streets');

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      // ✅ FETCH: Use ID logic
      const url = currentUserId
        ? `${API_URL}/api/places?userId=${currentUserId}`
        : `${API_URL}/api/places`;

      const fetchPromise = axios.get(url);
      const timerPromise = new Promise(resolve => setTimeout(resolve, 3000));
      const [res] = await Promise.all([fetchPromise, timerPromise]);

      setPlaces(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, [currentUserId]);

  const handleLogout = () => {
    // ✅ CLEAR ALL KEYS
    myStorage.removeItem("user_id");
    myStorage.removeItem("user_name");
    myStorage.removeItem("user_email");
    myStorage.removeItem("token");
    setCurrentUserId(null);
    setCurrentUserName(null);
    setPlaces([]);
  };

  const handleSearch = async (query) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setSearchResult({ lat: parseFloat(lat), lng: parseFloat(lon), name: display_name });
      } else {
        toast.error("Location not found! Try a different city.");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { background: '#fff', color: '#333', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontFamily: "'Segoe UI', sans-serif", fontSize: '0.95rem', maxWidth: '400px' }, success: { iconTheme: { primary: '#27ae60', secondary: 'white' }, style: { borderLeft: '6px solid #27ae60' } }, error: { iconTheme: { primary: '#e74c3c', secondary: 'white' }, style: { borderLeft: '6px solid #e74c3c' } } }} />
      {loading && <Loader text="Exploring the world..." />}

      <Navbar
        onSearch={handleSearch}
        onAddClick={() => currentUserId ? toast("✨ Double-click anywhere on the map to pin a memory!", { icon: '👆', style: { borderLeft: '6px solid #3498db' } }) : setShowLogin(true)}
        onLocateClick={() => setTriggerLocate(true)}
        currentLayer={currentLayer} setLayer={setCurrentLayer}

        // ✅ FIX: Use currentUserName for display
        currentUser={currentUserName}

        onLogout={handleLogout}
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {currentUserId && <StatsWidget places={places} />}
      {currentUserId && <TripDetails place={selectedPlace} onClose={() => setSelectedPlace(null)} onUpdateMap={fetchPlaces} />}
      {currentUserId && <AddTripForm newLocation={newLocation} onClose={() => setNewLocation(null)} onSaveSuccess={() => { setNewLocation(null); fetchPlaces(); }} />}

      {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUserName} openForgot={() => setShowForgot(true)} />}
      {showRegister && <Register setShowRegister={setShowRegister} />}
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
      {showProfile && (
        <Profile
          onClose={() => setShowProfile(false)}
          currentUser={currentUserName}
          setCurrentUser={setCurrentUserName}
          onLogout={handleLogout}
        />
      )}

      <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={true} doubleClickZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
        <MapController searchResult={searchResult} userLocation={userPos} triggerLocate={triggerLocate} setTriggerLocate={setTriggerLocate} onUserLocationFound={setUserPos} />

        {/* ✅ FIX: Pass currentUserId */}
        <MapEventsHandler
          setNewLocation={setNewLocation}
          setSelectedPlace={setSelectedPlace}
          currentUserId={currentUserId}
        />

        {currentLayer === 'streets' ? (<TileLayer url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" maxZoom={20} subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution='&copy; Google Maps' />) : (<TileLayer url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" maxZoom={20} subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution='&copy; Google Maps' />)}

        {places.map((p) => (
          <Marker key={p._id} position={[p.location.lat, p.location.lng]} icon={p.status === 'visited' ? visitedIcon : bucketIcon} eventHandlers={{ click: () => { setSelectedPlace(p); setNewLocation(null); }, mouseover: (e) => e.target.openTooltip(), mouseout: (e) => e.target.closeTooltip() }}>
            <Tooltip direction="top" offset={[0, -5]} opacity={1} className="custom-tooltip">
              <div className="tooltip-content"><div className="tooltip-title">{p.title}</div><div className="tooltip-date">{p.status === 'visited' && p.visitDate ? new Date(p.visitDate).getFullYear() : 'Dream'}</div></div>
            </Tooltip>
          </Marker>
        ))}
        {userPos && <Marker position={userPos} icon={currentLocationIcon}><Popup>You are here</Popup></Marker>}
        {searchResult && <Marker position={[searchResult.lat, searchResult.lng]} icon={searchIcon}><Popup isOpen={true}><strong>Found:</strong><br />{searchResult.name}</Popup></Marker>}
      </MapContainer>
    </div>
  );
}
export default App;