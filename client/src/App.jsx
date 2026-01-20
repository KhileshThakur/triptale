import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Import Sub-Components
import Sidebar from './Sidebar';
import AddTripForm from './AddTripForm';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import UpdatePassword from './UpdatePassword';

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// 1. CUSTOM MARKERS
// ==========================================
const iconConfig = {
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
  tooltipAnchor: [0, -32],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [28, 28],
  shadowAnchor: [8, 28]
};

const visitedIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' });
const bucketIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png' });
const searchIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' });
const currentLocationIcon = new L.Icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png' });

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================

const StatsWidget = ({ places }) => {
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
    <div className="stats-widget">
      <div style={{ padding: '16px 20px 10px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Map Legend</h4>
        <LegendRow label="Visited" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" />
        <LegendRow label="Bucket List" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" />
        <LegendRow label="Search Result" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" />
        <LegendRow label="Your Location" iconUrl="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" />
      </div>
      <div style={{ display: 'flex', background: 'white' }}>
        <div style={{ flex: 1, padding: '15px 10px', textAlign: 'center', borderRight: '1px solid #eee' }}>
          <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#2ecc71', lineHeight: 1, marginBottom: '4px' }}>{visitedCount}</span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#999', fontWeight: 700 }}>Visited</span>
        </div>
        <div style={{ flex: 1, padding: '15px 10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#f1c40f', lineHeight: 1, marginBottom: '4px' }}>{bucketCount}</span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#999', fontWeight: 700 }}>Bucket List</span>
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

// --- UPDATED HANDLER: ROBUST REVERSE GEOCODING ---
// --- ROBUST REVERSE GEOCODING ---
function MapEventsHandler({ setNewLocation, setSelectedPlace }) {
  useMapEvents({
    dblclick: async (e) => {
      const { lat, lng } = e.latlng;

      // 1. Immediate Feedback
      setNewLocation({ lat, lng, address: "Locating..." });
      setSelectedPlace(null);

      try {
        // 2. Fetch with more specific params
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en-US,en;q=0.9' } } // Try to force English
        );

        const data = res.data;
        let finalAddress = "";

        if (data.display_name) {
          // Use the full fancy name if available
          finalAddress = data.display_name;
        } else if (data.address) {
          // Fallback: Construct it manually if display_name is missing
          const { city, town, village, country } = data.address;
          finalAddress = [city || town || village, country].filter(Boolean).join(", ");
        }

        // 3. Update State
        setNewLocation({
          lat,
          lng,
          address: finalAddress || "Address not found" // Fallback string instead of null
        });

      } catch (err) {
        console.error("Geocoding Error:", err);
        // On error, show generic text so user knows we tried
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
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));

  // Auth Modal States
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showUpdatePass, setShowUpdatePass] = useState(false);
  const [places, setPlaces] = useState([]);
  const [newLocation, setNewLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [triggerLocate, setTriggerLocate] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('streets');

  const fetchPlaces = async () => {
    try {
      // If logged in, fetch MY pins. If not, fetch nothing (or public pins)
      const url = currentUser
        ? `${API_URL}/api/places?username=${currentUser}`
        : `${API_URL}/api/places`;
      const res = await axios.get(url);
      setPlaces(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPlaces(); }, [currentUser]); // Refetch when user changes

  const handleLogout = () => {
    myStorage.removeItem("user");
    myStorage.removeItem("token"); // Clears the JWT
    setCurrentUser(null);
    setPlaces([]);
  };

  const handleSearch = async (query) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setSearchResult({ lat: parseFloat(lat), lng: parseFloat(lon), name: display_name });
      } else { alert("Location not found"); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>

      <Navbar
        onSearch={handleSearch}
        onAddClick={() => currentUser ? alert("Double click map!") : setShowLogin(true)}
        onLocateClick={() => setTriggerLocate(true)}
        currentLayer={currentLayer} setLayer={setCurrentLayer}

        // Auth Props
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
        onUpdatePassClick={() => setShowUpdatePass(true)}
      />

      {/* Show these only if logged in */}
      {currentUser && <StatsWidget places={places} />}
      {currentUser && <Sidebar place={selectedPlace} onClose={() => setSelectedPlace(null)} onUpdateMap={fetchPlaces} />}
      {currentUser && <AddTripForm newLocation={newLocation} onClose={() => setNewLocation(null)} onSaveSuccess={() => { setNewLocation(null); fetchPlaces(); }} />}

      {/* Auth Modals */}
      {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser} openForgot={() => setShowForgot(true)} />}
      {showRegister && <Register setShowRegister={setShowRegister} />}
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
      {showUpdatePass && <UpdatePassword onClose={() => setShowUpdatePass(false)} currentUser={currentUser} />}
        
      <MapContainer
        center={[20, 0]} zoom={3} scrollWheelZoom={true} doubleClickZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}
      >
        <MapController searchResult={searchResult} userLocation={userPos} triggerLocate={triggerLocate} setTriggerLocate={setTriggerLocate} onUserLocationFound={setUserPos} />
        {currentUser && <MapEventsHandler setNewLocation={setNewLocation} setSelectedPlace={setSelectedPlace} />}
        {/* --- TILE LAYERS (Directly rendered based on state, no LayersControl) --- */}
        {currentLayer === 'streets' ? (
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution='&copy; Google Maps'
          />
        ) : (
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution='&copy; Google Maps'
          />
        )}

        {places.map((p) => (
          <Marker
            key={p._id} position={[p.location.lat, p.location.lng]} icon={p.status === 'visited' ? visitedIcon : bucketIcon}
            eventHandlers={{ click: () => { setSelectedPlace(p); setNewLocation(null); }, mouseover: (e) => e.target.openTooltip(), mouseout: (e) => e.target.closeTooltip() }}
          >
            <Tooltip direction="top" offset={[0, -32]} opacity={1} className="custom-tooltip">
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