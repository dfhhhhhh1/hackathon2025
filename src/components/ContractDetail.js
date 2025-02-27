
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import ContractContext from '../context/ContractContext';

const ContractDetail = () => {
  const { contractID } = useParams();
  const { contracts } = useContext(ContractContext);
  const contract = contracts.find((contract) => contract.ContractID.toString() === contractID);

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="contract-detail">
      <h2>{contract.CompanyName}</h2>
      <p>Contract ID: {contract.ContractID}</p>
      <p>Agency: {contract.Agency}</p>
      <p>Location: {contract.Location}</p>
      <p>Value: ${contract.Value}</p>
      <p>Date: {contract.Date}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default ContractDetail;
