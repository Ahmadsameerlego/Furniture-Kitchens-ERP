import React from 'react';
import { ManufacturingWorkspace } from './production/ManufacturingWorkspace';

export const ProductionListPage: React.FC = () => {
  return <ManufacturingWorkspace initialTab="mfg_dashboard" />;
};
