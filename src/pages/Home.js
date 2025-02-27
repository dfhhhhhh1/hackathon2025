import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './Home.css';
import Map from '../components/Map';

import { MarkerClusterGroup } from 'react-leaflet-markercluster';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
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

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [hasSearchResults, setHasSearchResults] = useState(false);

  
  const defaultPosition = [39.8283, -98.5795]; 
  
  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        const result = {
          title: 'Search Result Title',
          description: 'This is the result description returned from the backend.',
        };
        setData(result);
        setLoading(false);
      }, 2000); // Simulated 2-second delay
    };

    fetchData();
  }, []);

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
        
        const contractsWithCoordinates = response.data
        .filter(contract =>
            contract['Contract ID'] &&
            contract['Contract ID'].trim() !== '' &&
            contract.Latitude && contract.Longitude &&
            contract.Latitude.toString().trim() !== '' &&
            contract.Longitude.toString().trim() !== ''
        )
        .map(contract => ({
            ...contract,
            coordinates: [parseFloat(contract.Latitude), parseFloat(contract.Longitude)]
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
    setSearchQuery(e.target.value); // Update the search query state
  
    // Trigger API call only when Enter is pressed
    if (e.key === 'Enter') {
      const query = e.target.value;
      setIsLoading(true); // Set loading to true when starting the search
  
      if (query.trim() === '') {
        setFilteredContracts(contracts); // Reset to all contracts if query is empty
        setHasSearchResults(false); // No search results
        setIsLoading(false); // Stop loading after resetting
      } else {
        try {
          const response = await axios.get(`http://localhost:5001/api/contracts/search?query=${query}`);
          const filteredWithCoordinates = response.data
            .filter(contract =>
              contract.Latitude && contract.Longitude &&
              contract.Latitude.toString().trim() !== '' &&
              contract.Longitude.toString().trim() !== ''
            )
            .map(contract => {
              const originalContract = contracts.find(c => c['Contract ID'] === contract['Contract ID']);
              return {
                ...contract,
                coordinates: originalContract ? originalContract.coordinates : defaultPosition
              };
            });
  
          setFilteredContracts(filteredWithCoordinates);
          setHasSearchResults(true); // Set to true when search results are available
        } catch (error) {
          console.error('Error searching contracts:', error);
        } finally {
          setIsLoading(false); // Stop loading after fetching search results
        }
      }
    }
  };
  
  
  

  
  const applyFilters = async () => {
    try {
        setFilteredContracts([]);
      const response = await axios.get('http://localhost:5001/api/contracts', {
        params: {
          state: selectedState,
          description: selectedDescription,
          min_cost: contractCost,
          tags: selectedTags
        }
      });
  
      const filteredWithCoordinates = response.data
        .filter(contract =>
          contract.Latitude && contract.Longitude &&
          contract.Latitude.toString().trim() !== '' &&
          contract.Longitude.toString().trim() !== ''
        )
        .map(contract => ({
          ...contract,
          coordinates: [parseFloat(contract.Latitude), parseFloat(contract.Longitude)]
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
            onChange={(e) => setSearchQuery(e.target.value)} // Update state as you type
            onKeyDown={handleSearch} // Handle the Enter key press to trigger search
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
              {hasSearchResults ? (
                // Render search results if available
                filteredContracts.map(contract => (
                  <div key={contract['Contract ID']} className="contract-item">
                    <h3>{contract['Legal Business Name']}</h3>
                    <p><strong>Contract ID:</strong> {contract['Contract ID']}</p>
                    <p><strong>Agency:</strong> {contract['Contracting Agency']}</p>
                    <p><strong>Value:</strong> {formatCurrency(contract['Action Obligation ($)'])}</p>
                    <p><strong>Date Signed:</strong> {contract['Date Signed']}</p>
                  </div>
                ))
              ) : (
                // Otherwise, show the full list of contracts
                <div className="contracts-list">
                  {contracts.map(contract => (
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
          )}
        </div>

        <div className="map-container">
          {isLoading ? (
            <div className="skeleton-loader">
              <div className="skeleton-map">
                <Skeleton height={30} count={2} />
                <Skeleton height={100} count={4} />
              </div>
            </div>
          ) : (
            // Conditionally show the map if no search results are available
            !hasSearchResults && <Map filteredContracts={filteredContracts} />
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;