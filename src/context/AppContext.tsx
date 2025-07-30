import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { I_CandidateWithScore } from '@/types';
import { candidateCache } from '@/utils/api';
import { clearShortlistedTeam, clearTeamSize, isStorageAvailable, loadShortlistedTeam, loadTeamSize, saveShortlistedTeamAsync, saveTeamSizeAsync } from '@/utils/storage';

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

  // Check storage availability
  const storageAvailable = isStorageAvailable();

  // Load candidates data
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await candidateCache.getCandidates();
      
      if (result.error) {
        setError(result.error);
        setCandidates([]);
      } else if (result.data) {
        setCandidates(result.data);
      }
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

  // Load shortlisted team from localStorage on mount
  useEffect(() => {
    if (storageAvailable) {
      const savedTeam = loadShortlistedTeam();
      const savedTeamSize = loadTeamSize();
      
      if (savedTeam.length > 0) {
        setShortlistedTeam(savedTeam);
      }
      
      if (savedTeamSize > 0) {
        setTeamSizeState(savedTeamSize);
      }
    }
  }, [storageAvailable]);

  // Save shortlisted team to localStorage when it changes
  useEffect(() => {
    if (storageAvailable) {
      saveShortlistedTeamAsync(shortlistedTeam).catch(error => {
        console.error('Failed to save shortlisted team:', error);
      });
    }
  }, [shortlistedTeam, storageAvailable]);

  // Save team size to localStorage when it changes
  useEffect(() => {
    if (storageAvailable) {
      saveTeamSizeAsync(teamSize).catch(error => {
        console.error('Failed to save team size:', error);
      });
    }
  }, [teamSize, storageAvailable]);

  // Actions
  const setTeamSize = useCallback((size: number) => {
    setTeamSizeState(size);
    
    // If new team size is smaller than current shortlisted team, trim the excess candidates
    if (size < shortlistedTeam.length) {
      const trimmedTeam = shortlistedTeam.slice(0, size);
      setShortlistedTeam(trimmedTeam);
    }
  }, [teamSize, shortlistedTeam]);

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
  }, [shortlistedTeam.length]);

  const clearShortlist = useCallback(() => {
    setShortlistedTeam([]);
    setTeamSizeState(0);
    
    if (storageAvailable) {
      clearShortlistedTeam();
      clearTeamSize();
    }
  }, [storageAvailable]);

  // Context value
  const contextValue: AppContextType = {
    candidates,
    loading,
    error,
    shortlistedTeam,
    teamSize,
    setTeamSize,
    addToShortlist,
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