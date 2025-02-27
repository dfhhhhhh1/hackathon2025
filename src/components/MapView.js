
import React, { useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngLiteral } from 'leaflet';
import ContractContext from '../context/ContractContext';

const MapView = () => {
  const { contracts } = useContext(ContractContext);

  
  const locationToLatLng = (location) => {
    const [state, city] = location.split(',');
    return { lat: 38.907, lng: -77.0369 };
  };

  return (
    <MapContainer center={[38.907, -77.0369]} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {contracts.map((contract) => {
        const position = locationToLatLng(contract.Location);
        return (
          <Marker key={contract.ContractID} position={position}>
            <Popup>
              <div>
                <h3>{contract.CompanyName}</h3>
                <p>Value: ${contract.Value}</p>
                <p>Agency: {contract.Agency}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
