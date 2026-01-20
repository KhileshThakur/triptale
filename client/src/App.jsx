import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { FaLocationArrow, FaSearch, FaMapMarkedAlt } from 'react-icons/fa'; 

import Sidebar from './Sidebar';
import AddTripForm from './AddTripForm';

// --- ICONS ---
const visitedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], tooltipAnchor: [15, -28], shadowSize: [41, 41]
});

const bucketIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], tooltipAnchor: [15, -28], shadowSize: [41, 41]
});

const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const searchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- SUB-COMPONENTS ---

const Navbar = ({ onSearch, onAddClick, onLocateClick }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if(query) onSearch(query);
  };

  return (
    <nav className="floating-nav">
      <div className="logo">TripTale.</div>
      <form onSubmit={handleSearch} className="search-bar">
        <FaSearch color="#666" />
        <input 
          type="text" 
          placeholder="Search location..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <div className="nav-links">
        {/* LOCATE ME BUTTON MOVED HERE */}
        <div className="nav-item icon-btn" onClick={onLocateClick} title="Locate Me">
            <FaLocationArrow />
        </div>
        <div className="nav-item">Gallery</div>
        <div className="nav-item btn-add" onClick={onAddClick}>+ Add Trip</div>
      </div>
    </nav>
  );
};

// UPDATED STATS WIDGET WITH LEGEND COLORS
const StatsWidget = ({ places }) => {
  const visitedCount = places.filter(p => p.status === 'visited').length;
  const bucketCount = places.filter(p => p.status === 'bucket-list').length;
  return (
    <div className="stats-widget">
      <div className="stat-item">
        <span className="stat-num" style={{color: '#10b981'}}>
            {/* Green Dot Legend */}
            <span style={{display:'inline-block', width:'10px', height:'10px', background:'#10b981', borderRadius:'50%', marginRight:'5px'}}></span>
            {visitedCount}
        </span>
        <span className="stat-label">Visited</span>
      </div>
      <div style={{width:'1px', background:'#eee'}}></div>
      <div className="stat-item">
        <span className="stat-num" style={{color: '#f59e0b'}}>
            {/* Gold Dot Legend */}
            <span style={{display:'inline-block', width:'10px', height:'10px', background:'#f59e0b', borderRadius:'50%', marginRight:'5px'}}></span>
            {bucketCount}
        </span>
        <span className="stat-label">Bucket List</span>
      </div>
    </div>
  );
};

// Logic to move map
const MapController = ({ searchResult, userLocation, triggerLocate, setTriggerLocate, onUserLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    if (searchResult) {
      map.flyTo([searchResult.lat, searchResult.lng], 14, { animate: true });
    }
  }, [searchResult, map]);

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true });
    }
  }, [userLocation, map]);

  // LOCATE ME LOGIC TRIGGERED FROM NAVBAR
  useEffect(() => {
    if (triggerLocate) {
        map.locate();
        setTriggerLocate(false); // Reset trigger
    }
  }, [triggerLocate, map, setTriggerLocate]);

  // Handle Location Found Event
  useMapEvents({
    locationfound(e) {
        onUserLocationFound(e.latlng);
        map.flyTo(e.latlng, 13, { animate: true });
    },
  });

  return null;
};

function MapEventsHandler({ setNewLocation, setSelectedPlace }) {
    useMapEvents({
        dblclick: (e) => {
            setNewLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            setSelectedPlace(null);
        },
    });
    return null;
}

// --- MAIN APP ---
function App() {
  const [places, setPlaces] = useState([]);
  const [newLocation, setNewLocation] = useState(null); 
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [userPos, setUserPos] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [triggerLocate, setTriggerLocate] = useState(false); // State to trigger location from Navbar

  const fetchPlaces = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/places');
      setPlaces(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPlaces(); }, []);

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
      
      {/* NAVBAR WITH LOCATE BUTTON */}
      <Navbar 
        onSearch={handleSearch} 
        onAddClick={() => alert("Double click map to add!")} 
        onLocateClick={() => setTriggerLocate(true)}
      />
      
      <StatsWidget places={places} />

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

      <MapContainer 
        center={[20, 0]} zoom={3} scrollWheelZoom={true} doubleClickZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}
      > 
        <MapController 
            searchResult={searchResult} 
            userLocation={userPos} 
            triggerLocate={triggerLocate} 
            setTriggerLocate={setTriggerLocate}
            onUserLocationFound={setUserPos}
        />
        
        <MapEventsHandler setNewLocation={setNewLocation} setSelectedPlace={setSelectedPlace} />

        <LayersControl position="bottomleft">
            <LayersControl.BaseLayer checked name="Google Streets">
                <TileLayer url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" maxZoom={20} subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution='&copy; Google Maps' />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google Hybrid">
                <TileLayer url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" maxZoom={20} subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution='&copy; Google Maps' />
            </LayersControl.BaseLayer>
        </LayersControl>

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
            <Tooltip direction="top" offset={[0, -40]} opacity={1} className="custom-tooltip">
              {p.title}
            </Tooltip>
          </Marker>
        ))}

        {userPos && <Marker position={userPos} icon={currentLocationIcon}><Popup>You are here</Popup></Marker>}
        {searchResult && <Marker position={[searchResult.lat, searchResult.lng]} icon={searchIcon}><Popup isOpen={true}>Search: {searchResult.name}</Popup></Marker>}

      </MapContainer>
    </div>
  );
}

export default App;