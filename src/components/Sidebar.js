
import React, { useContext } from 'react';
import ContractContext from '../context/ContractContext';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { contracts } = useContext(ContractContext);

  return (
    <div className="sidebar">
      <h2>Contracts</h2>
      <ul>
        {contracts.map((contract) => (
          <li key={contract.ContractID}>
            <Link to={`/contract/${contract.ContractID}`}>{contract.CompanyName}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
