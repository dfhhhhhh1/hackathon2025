import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './Home.css';


import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Home = () => {
    const [contracts, setContracts] = useState([]);
    const [filteredContracts, setFilteredContracts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
  

    const [selectedState, setSelectedState] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('');
    const [contractCost, setContractCost] = useState('');
    const [selectedTags, setSelectedTags] = useState('');
  
    const [states, setStates] = useState([]);
    const [descriptions, setDescriptions] = useState([]);


  
  const defaultPosition = [39.8283, -98.5795]; 
  
  useEffect(() => {
    fetch('http://localhost:5001/api/states')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const stateOptions = data.map((state) => ({
            value: state,
            label: state,
          }));
          setStates(stateOptions);
        } else {
          console.error('Expected an array, but received:', data);
        }
      })
      .catch((error) => console.error('Error fetching states:', error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5001/api/descriptions')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const descriptionOptions = data.map((description) => ({
            value: description,
            label: description,
          }));
          setDescriptions(descriptionOptions);
        } else {
          console.error('Expected an array, but received:', data);
        }
      })
      .catch((error) => console.error('Error fetching descriptions:', error));
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5001/api/contracts');
        
        const contractsWithCoordinates = response.data.map(contract => ({
          ...contract,
                    coordinates: [contract.Latitude, contract.Longitude]
        }));
        setContracts(contractsWithCoordinates);
        setFilteredContracts(contractsWithCoordinates);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContracts();
  }, []);
  


  
  
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value.replace(/[^0-9.-]+/g, '')));
  };
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredContracts(contracts);
    } else {
      try {
        const response = await axios.get(`http://localhost:5001/api/contracts/search?query=${query}`);
        const filteredWithCoordinates = response.data.map(contract => {
          const originalContract = contracts.find(c => c['Contract ID'] === contract['Contract ID']);
          return {
            ...contract,
            coordinates: originalContract ? originalContract.coordinates : defaultPosition
          };
        });
        setFilteredContracts(filteredWithCoordinates);
      } catch (error) {
        console.error('Error searching contracts:', error);
      }
    }
  };

  
  const applyFilters = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/contracts', {
        params: {
          state: selectedState,
          description: selectedDescription,
          cost: contractCost,
          tags: selectedTags
        }
      });

      const filteredWithCoordinates = response.data.map(contract => ({
        ...contract,
        coordinates: [contract.Latitude, contract.Longitude]
      }));

      setFilteredContracts(filteredWithCoordinates);
    } catch (error) {
      console.error('Error filtering contracts:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search contracts by company, ID, agency..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="filters-container">
        <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
        >
            <option value="">Select State, All</option>
            {states.map((state) => (
            <option key={state.value} value={state.value}>
                {state.label}
            </option>
            ))}
        </select>

        <select
            value={selectedDescription}
            onChange={(e) => setSelectedDescription(e.target.value)}
        >
            <option value="">Select Description, All</option>
            {descriptions.map((description) => (
            <option key={description.value} value={description.value}>
                {description.label}
            </option>
            ))}
        </select>

        <input
          type="number"
          placeholder="Contract Cost (min)"
          value={contractCost}
          onChange={(e) => setContractCost(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={selectedTags}
          onChange={(e) => setSelectedTags(e.target.value)}
        />

        <button onClick={applyFilters}>Apply Filters</button>
      </div>
      <div className="content-container">
        <div className="sidebar">
          <h2>Government Contracts</h2>
          {isLoading ? (
            <p>Loading contracts...</p>
          ) : (
            <div className="contracts-list">
              {filteredContracts.map(contract => (
                <div key={contract['Contract ID']} className="contract-item">
                  <h3>{contract['Legal Business Name']}</h3>
                  <p><strong>Contract ID:</strong> {contract['Contract ID']}</p>
                  <p><strong>Agency:</strong> {contract['Contracting Agency']}</p>
                  <p><strong>Value:</strong> {formatCurrency(contract['Action Obligation ($)'])}</p>
                  <p><strong>Date Signed:</strong> {contract['Date Signed']}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="map-container">
          <MapContainer center={defaultPosition} zoom={4} style={{ height: '100%', width: '100%' }} >
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
                        <p><strong>Value:</strong> {formatCurrency(contract['Obligation ($)'])}</p>
                    </div>
                    </Popup>
                </Marker>
                ))}

          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;