import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import './Map.css';



let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ filteredContracts }) => {
  const defaultPosition = [39.8283, -98.5795]; // Default position if no contract is found

  return (
    <div className="map-container">
      <MapContainer center={defaultPosition} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredContracts && filteredContracts.length > 0 && filteredContracts.map(contract => (
          <Marker key={contract['Contract ID']} position={contract.coordinates}>
            <Popup>
              <div>
                <h3>{contract['Legal Business Name']}</h3>
                <p><strong>Contract ID:</strong> {contract['Contract ID']}</p>
                <p><strong>Agency:</strong> {contract['Contracting Agency']}</p>
                <p><strong>Value:</strong> {contract['Action Obligation ($)']}</p>
                <p><strong>Date Signed:</strong> {contract['Date Signed']}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
