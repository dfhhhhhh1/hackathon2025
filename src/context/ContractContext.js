// src/context/ContractContext.js
import React, { createContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);

  useEffect(() => {
    Papa.parse('/data/cleaned_budget_cuts2.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setContracts(result.data);
        setFilteredContracts(result.data);
      },
    });
  }, []);

  const filterContracts = (query) => {
    setFilteredContracts(
      contracts.filter(
        (contract) =>
          contract.CompanyName.toLowerCase().includes(query.toLowerCase()) ||
          contract.ContractID.toString().includes(query)
      )
    );
  };

  return (
    <ContractContext.Provider value={{ contracts: filteredContracts, filterContracts }}>
      {children}
    </ContractContext.Provider>
  );
};

export default ContractContext;
