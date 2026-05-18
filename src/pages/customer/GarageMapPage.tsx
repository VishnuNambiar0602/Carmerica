import React from 'react';
import GarageMap from '../../components/GarageMap';

const GarageMapPage = () => {
  return <GarageMap onClose={() => window.history.back()} />;
};

export default GarageMapPage;
