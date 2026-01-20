import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Import Sub-Components
import Sidebar from './Sidebar';
import AddTripForm from './AddTripForm';
import Navbar from './Navbar';

// ==========================================
// 1. CUSTOM IMAGE MARKERS (Classic Look, Smaller Size)
// ==========================================

// Configuration for Small Icons
const iconConfig = {
  iconSize: [20, 32],       // Smaller size (was 25x41)
  iconAnchor: [10, 32],     // Tip of the pin (half width, full height)
  popupAnchor: [0, -32],    // Popup opens just above the pin
  tooltipAnchor: [0, -32],  // Tooltip opens just above the pin
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [30, 30],     // Smaller shadow
  shadowAnchor: [8, 30]
};

const visitedIcon = new L.Icon({
  ...iconConfig,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
});

const bucketIcon = new L.Icon({
  ...iconConfig,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
});

const searchIcon = new L.Icon({
  ...iconConfig,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
});

const currentLocationIcon = new L.Icon({
  ...iconConfig,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
});

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
// --- UPDATED STATS WIDGET (Card Layout) ---
const StatsWidget = ({ places }) => {
  const visitedCount = places.filter(p => p.status === 'visited').length;
  const bucketCount = places.filter(p => p.status === 'bucket-list').length;

  // 1. Helper for the Tear-drop Pin
  const RenderPin = ({ color, icon }) => (
    <div style={{
        width:'18px', height:'18px', backgroundColor: color, 
        borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '1px solid white',
        flexShrink: 0
    }}>
        <div style={{transform: 'rotate(45deg)', color: 'white', fontSize: '9px', fontWeight:'bold'}}>{icon}</div>
    </div>
  );

  // 2. Helper for the User Dot
  const RenderDot = ({ color }) => (
      <div style={{
        width:'14px', height:'14px', backgroundColor: color, 
        borderRadius: '50%', border: '2px solid white', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', flexShrink: 0
      }}></div>
  );

  // 3. Helper for a single Legend Row
  const LegendRow = ({ label, component }) => (
    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
        <div style={{width: '24px', display:'flex', justifyContent:'center'}}>{component}</div>
        <span style={{fontSize: '0.85rem', color: '#555', fontWeight: 600}}>{label}</span>
    </div>
  );

  return (
    <div className="stats-widget" style={{
        flexDirection: 'column', 
        padding: 0, 
        gap: 0, 
        alignItems: 'stretch',
        minWidth: '220px',
        overflow: 'hidden' // Keeps rounded corners clean
    }}>
      
      {/* SECTION 1: LEGEND */}
      <div style={{padding: '20px 20px 12px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee'}}>
          <h4 style={{margin: '0 0 12px 0', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px'}}>Map Legend</h4>
          
          <LegendRow label="Visited" component={<RenderPin color="#00b894" icon="✔" />} />
          <LegendRow label="Bucket List" component={<RenderPin color="#ffa502" icon="★" />} />
          <LegendRow label="Search Result" component={<RenderPin color="#ff4757" icon="?" />} />
          <LegendRow label="Your Location" component={<RenderDot color="#2e86de" />} />
      </div>

      {/* SECTION 2: SCOREBOARD */}
      <div style={{display: 'flex', background: 'white'}}>
          {/* Left: Visited */}
          <div style={{flex: 1, padding: '15px 10px', textAlign: 'center', borderRight: '1px solid #eee'}}>
              <span style={{display:'block', fontSize: '1.6rem', fontWeight: 800, color: '#00b894', lineHeight: 1, marginBottom: '4px'}}>
                {visitedCount}
              </span>
              <span style={{fontSize: '0.7rem', textTransform: 'uppercase', color: '#999', fontWeight: 700}}>Visited</span>
          </div>

          {/* Right: Bucket */}
          <div style={{flex: 1, padding: '15px 10px', textAlign: 'center'}}>
              <span style={{display:'block', fontSize: '1.6rem', fontWeight: 800, color: '#ffa502', lineHeight: 1, marginBottom: '4px'}}>
                {bucketCount}
              </span>
              <span style={{fontSize: '0.7rem', textTransform: 'uppercase', color: '#999', fontWeight: 700}}>Bucket List</span>
          </div>
      </div>

    </div>
  );
};

// Controls Map Movement (Flying to locations)
const MapController = ({ searchResult, userLocation, triggerLocate, setTriggerLocate, onUserLocationFound }) => {
  const map = useMap();

  // Fly to Search Result
  useEffect(() => {
    if (searchResult) {
      map.flyTo([searchResult.lat, searchResult.lng], 14, { animate: true, duration: 1.5 });
    }
  }, [searchResult, map]);

  // Fly to User Location
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true, duration: 1.5 });
    }
  }, [userLocation, map]);

  // Handle Navbar "Locate Me" click
  useEffect(() => {
    if (triggerLocate) {
      map.locate();
      setTriggerLocate(false);
    }
  }, [triggerLocate, map, setTriggerLocate]);

  // Listen for Leaflet location found event
  useMapEvents({
    locationfound(e) {
      onUserLocationFound(e.latlng);
      map.flyTo(e.latlng, 13, { animate: true });
    },
  });

  return null;
};

// Handle Double Clicks to Add Pin
function MapEventsHandler({ setNewLocation, setSelectedPlace }) {
    useMapEvents({
        dblclick: (e) => {
            setNewLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            setSelectedPlace(null);
        },
    });
    return null;
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
function App() {
  const [places, setPlaces] = useState([]);
  const [newLocation, setNewLocation] = useState(null); 
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [userPos, setUserPos] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [triggerLocate, setTriggerLocate] = useState(false);
  
  // Toggle between Street and Satellite
  const [currentLayer, setCurrentLayer] = useState('streets');

  // Load Data
  const fetchPlaces = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/places');
      setPlaces(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPlaces(); }, []);

  // Handle Search API (OpenStreetMap Nominatim)
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
      
      {/* --- UI OVERLAYS --- */}
      <Navbar 
        onSearch={handleSearch} 
        onAddClick={() => alert("Double click anywhere on the map to add a pin!")} 
        onLocateClick={() => setTriggerLocate(true)}
        currentLayer={currentLayer}
        setLayer={setCurrentLayer}
      />
      
      <StatsWidget places={places} />

      {/* --- SIDEBARS --- */}
      <Sidebar 
        place={selectedPlace} 
        onClose={() => setSelectedPlace(null)}
        onUpdateMap={fetchPlaces} 
      />
      
      <AddTripForm 
        newLocation={newLocation} 
        onClose={() => setNewLocation(null)}
        onSaveSuccess={() => { setNewLocation(null); fetchPlaces(); }}
      />

      {/* --- MAP --- */}
      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        scrollWheelZoom={true} 
        doubleClickZoom={false} // Disable default dblclick zoom to use for adding pins
        style={{ height: "100%", width: "100%", zIndex: 0 }} 
        zoomControl={false} // We can add custom zoom controls later if needed
      > 
        {/* Logic Components (No UI) */}
        <MapController 
            searchResult={searchResult} 
            userLocation={userPos} 
            triggerLocate={triggerLocate} 
            setTriggerLocate={setTriggerLocate}
            onUserLocationFound={setUserPos}
        />
        <MapEventsHandler setNewLocation={setNewLocation} setSelectedPlace={setSelectedPlace} />

        {/* --- TILE LAYERS (Google Maps) --- */}
        <LayersControl position="bottomleft">
             {/* We use state to switch, but LayersControl keeps them organized */}
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
        </LayersControl>

        {/* --- MARKERS --- */}
        {places.map((p) => (
          <Marker 
            key={p._id} 
            position={[p.location.lat, p.location.lng]}
            icon={p.status === 'visited' ? visitedIcon : bucketIcon}
            eventHandlers={{
              click: () => { setSelectedPlace(p); setNewLocation(null); },
              mouseover: (e) => e.target.openTooltip(),
              mouseout: (e) => e.target.closeTooltip()
            }}
          >
            {/* NEW CUSTOM TOOLTIP (defined in CSS) */}
            <Tooltip direction="top" offset={[0, -32]} opacity={1} className="custom-tooltip">
              <div className="tooltip-content">
                <div className="tooltip-title">{p.title}</div>
                {/* Only show year for bucket list, full date for visited */}
                <div className="tooltip-date">
                    {p.status === 'visited' && p.visitDate 
                        ? new Date(p.visitDate).getFullYear() 
                        : 'Dream'}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* User Location Marker */}
        {userPos && (
            <Marker position={userPos} icon={currentLocationIcon}>
                <Popup>You are here</Popup>
            </Marker>
        )}

        {/* Search Result Marker */}
        {searchResult && (
            <Marker position={[searchResult.lat, searchResult.lng]} icon={searchIcon}>
                <Popup isOpen={true}>
                    <strong>Found:</strong><br/>{searchResult.name}
                </Popup>
            </Marker>
        )}

      </MapContainer>
    </div>
  );
}

export default App;