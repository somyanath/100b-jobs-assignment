import { useRef, useCallback, useEffect } from 'react';
import type { I_CandidateWithScore } from '../types/Candidate';
import { calculateCandidateScores } from '../utils/scoringAlgorithm'; // Assumes the non-sorting version

interface CacheEntry {
  scoredCandidate: I_CandidateWithScore;
  timestamp: number;
}

const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * A time-based cache for candidate scores.
 */
export function useCandidateScoreCache() {
  const cache = useRef(new Map<string, CacheEntry>());

  /**
   * Generates a cache key. 
   * NOTE: Filters are essential in the key. A candidate's score is only valid
   * for the specific filters used to generate it.
   */
  const generateCacheKey = useCallback((
    candidateId: string, 
    filters: { skills: string[]; experience: string[]; education: string[] }
  ): string => {
    const filterKey = JSON.stringify(filters);
    return `${candidateId}::${filterKey}`;
  }, []);

  /**
   * Scores a list of candidates, using the cache where possible.
   */
  const getScoredCandidates = useCallback((
    candidates: I_CandidateWithScore[], 
    filters: { skills: string[]; experience: string[]; education: string[] }
  ): I_CandidateWithScore[] => {
    
    const now = Date.now();
    const results: I_CandidateWithScore[] = [];
    const candidatesToScore: I_CandidateWithScore[] = [];
    const indicesToFill: number[] = [];

    // 1. Check cache for each candidate
    candidates.forEach((candidate, index) => {
      const key = generateCacheKey(candidate.id, filters);
      const entry = cache.current.get(key);

      if (entry && (now - entry.timestamp < CACHE_EXPIRATION_MS)) {
        results[index] = entry.scoredCandidate; // Use cached score
      } else {
        candidatesToScore.push(candidate); // Add to list to be scored
        indicesToFill.push(index);         // Remember its original position
      }
    });

    // 2. Score any candidates that were not in the cache
    if (candidatesToScore.length > 0) {
      const newlyScored = calculateCandidateScores(
        candidatesToScore, 
        filters.skills, 
        filters.experience, 
        filters.education
      );

      // 3. Add new scores to cache and results array
      newlyScored.forEach((scoredCand, i) => {
        const originalIndex = indicesToFill[i];
        results[originalIndex] = scoredCand; // Place in correct original position

        const key = generateCacheKey(scoredCand.id, filters);
        cache.current.set(key, { scoredCandidate: scoredCand, timestamp: now });
      });
    }

    return results;
  }, [generateCacheKey]);

  // 4. Periodic cleanup to prevent memory leaks over a long session
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      cache.current.forEach((entry, key) => {
        if (now - entry.timestamp >= CACHE_EXPIRATION_MS) {
          cache.current.delete(key);
        }
      });
    }, 60 * 1000); // Run cleanup every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return { getScoredCandidates };
}