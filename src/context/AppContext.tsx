import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { I_CandidateWithScore } from '@/types';

// Context interface
interface AppContextType {
  // Candidate data
  candidates: I_CandidateWithScore[];
  loading: boolean;
  error: string | null;
  
  // Shortlist management
  shortlistedTeam: I_CandidateWithScore[];
  teamSize: number;
  
  // Actions
  setTeamSize: (size: number) => void;
  addToShortlist: (candidate: I_CandidateWithScore) => void;
  removeFromShortlist: (candidateId: string) => void;
  clearShortlist: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // State
  const [candidates, setCandidates] = useState<I_CandidateWithScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistedTeam, setShortlistedTeam] = useState<I_CandidateWithScore[]>([]);
  const [teamSize, setTeamSizeState] = useState<number>(0);

  // Load candidates data
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading candidates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Actions
  const setTeamSize = useCallback((size: number) => {
    setTeamSizeState(size);
  }, []);

  const addToShortlist = useCallback((candidate: I_CandidateWithScore) => {
    setShortlistedTeam(prev => {
      // Check if candidate is already in the shortlist
      const exists = prev.some(c => c.id === candidate.id);
      if (exists) {
        return prev;
      }
      const newTeam = [...prev, candidate];
      return newTeam;
    });
  }, []);

  const removeFromShortlist = useCallback((candidateId: string) => {
    setShortlistedTeam(prev => prev.filter(c => c.id !== candidateId));
  }, []);

  const clearShortlist = useCallback(() => {
    setShortlistedTeam([]);
  }, []);

  // Context value
  const contextValue: AppContextType = {
    candidates,
    loading,
    error,
    shortlistedTeam,
    teamSize,
    setTeamSize,
    addToShortlist,
    removeFromShortlist,
    clearShortlist,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Export the context for custom hook
export { AppContext };