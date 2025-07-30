import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Main hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};