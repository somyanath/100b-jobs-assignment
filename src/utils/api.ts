import type { I_Candidate, I_CandidateWithScore } from "@/types";

// API response interface
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Generate unique ID for candidates (since the JSON doesn't have IDs)
 * Uses email and index to create a deterministic unique identifier
 */
const generateCandidateId = (candidate: I_Candidate, index: number): string => {
  // Create a unique ID based on email and index
  return `${candidate.email.replace('@', '-').replace('.', '-')}-${index}`;
};

/**
 * Transform raw candidate data to include calculated fields
 * Enhances the base Candidate type with computed properties
 */
const transformCandidate = (candidate: I_Candidate, index: number): I_CandidateWithScore => {
  const id = generateCandidateId(candidate, index);
  
  // Get current (most recent) role and company from work experience
  const currentRole = candidate.work_experiences.length > 0 
    ? candidate.work_experiences[0].roleName 
    : undefined;
  const currentCompany = candidate.work_experiences.length > 0 
    ? candidate.work_experiences[0].company 
    : undefined;
  
  // Get highest education level
  const highestEducation = candidate.education.highest_level;

  // the reason for generating the extra keys is to make the data usable with the shadcn table
  return {
    ...candidate,
    id,
    currentRole,
    currentCompany,
    highestEducation,
  };
};

/**
 * Fetch candidates data from the JSON file
 * Handles HTTP requests, data validation, and transformation
 */
const fetchCandidates = async (): Promise<ApiResponse<I_CandidateWithScore[]>> => {
  try {
    const response = await fetch('/resources/candidatesData.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData: I_Candidate[] = await response.json();
    
    // Validate that we received an array
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid data format: expected an array of candidates');
    }
    
    // Transform candidates to include calculated fields
    // Also filter out candidates that don't have a name
    const filteredData = rawData.filter(candidate => candidate.name && candidate.name !== '');
    const transformedData = filteredData.map((candidate, index) => 
      transformCandidate(candidate, index)
    );
    
    return {
      data: transformedData,
      error: null,
      loading: false,
    };
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
    
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      loading: false,
    };
  }
};

/**
 * Simple caching mechanism to prevent unnecessary refetches
 * Uses singleton pattern for global cache management
 */
class CandidateCache {
  private cache: I_CandidateWithScore[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get candidates data with caching
   * Returns cached data if fresh, otherwise fetches new data
   */
  async getCandidates(): Promise<ApiResponse<I_CandidateWithScore[]>> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return {
        data: this.cache,
        error: null,
        loading: false,
      };
    }

    // Fetch new data
    const result = await fetchCandidates();
    
    if (result.data) {
      this.cache = result.data;
      this.lastFetch = now;
    }

    return result;
  }

  /**
   * Clear the cache to force fresh data fetch
   */
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

// Export singleton cache instance
export const candidateCache = new CandidateCache();