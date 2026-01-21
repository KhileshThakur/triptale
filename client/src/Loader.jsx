import React from 'react';
import { FaGlobeAmericas, FaMapMarkerAlt } from 'react-icons/fa';
import './Loader.css'; // We will create this CSS file next

const Loader = ({ text = "Exploring the world...", fullScreen = true }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
      <div className="loader-content">
        
        {/* The Animation Group */}
        <div className="earth-pin-group">
          <FaMapMarkerAlt className="loader-pin" />
          <FaGlobeAmericas className="loader-earth" />
          <div className="loader-shadow"></div>
        </div>

        {/* The Text */}
        <h3 className="loader-text">{text}</h3>
      </div>
    </div>
  );
};

export default Loader;