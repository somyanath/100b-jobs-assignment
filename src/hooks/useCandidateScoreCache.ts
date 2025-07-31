import { useRef, useCallback, useEffect } from 'react';
import type { I_CandidateWithScore } from '../types/Candidate';
import { calculateCandidateScores } from '../utils/scoringAlgorithm';

interface CacheEntry {
  score: I_CandidateWithScore;
  timestamp: number;
  accessCount: number;
}

export function useCandidateScoreCache() {
  const cache = useRef(new Map<string, CacheEntry>());
  const stats = useRef({ totalRequests: 0, cacheHits: 0 });

  // Generate stable cache key from candidate and filters
  const generateCacheKey = useCallback((candidateId: string, filters: {
    skills: string[];
    experience: string[];
    education: string[];
  }): string => {
    const filterKey = [
      filters.skills.sort().join('|'),
      filters.experience.sort().join('|'),
      filters.education.sort().join('|')
    ].join('::');
    
    return `${candidateId}::${filterKey}`;
  }, []);

  // Batch score multiple candidates efficiently
  const getCachedScores = useCallback((
    candidates: I_CandidateWithScore[], 
    filters: { skills: string[]; experience: string[]; education: string[] }
  ): I_CandidateWithScore[] => {
    const results: I_CandidateWithScore[] = [];
    const uncachedCandidates: I_CandidateWithScore[] = [];
    const uncachedIndices: number[] = [];

    // First pass: collect cached results and identify uncached candidates
    candidates.forEach((candidate, index) => {
      const cacheKey = generateCacheKey(candidate.id, filters);
      stats.current.totalRequests++;
      
      const cached = cache.current.get(cacheKey);
      if (cached) {
        cached.accessCount++;
        cached.timestamp = Date.now();
        stats.current.cacheHits++;
        results[index] = cached.score;
      } else {
        uncachedCandidates.push(candidate);
        uncachedIndices.push(index);
      }
    });

    // Batch calculate uncached candidates
    if (uncachedCandidates.length > 0) {
      const batchScored = calculateCandidateScores(
        uncachedCandidates,
        filters.skills,
        filters.experience,
        filters.education
      );

      // Store batch results in cache and fill results array
      batchScored.forEach((scoredCandidate, batchIndex) => {
        const originalIndex = uncachedIndices[batchIndex];
        const cacheKey = generateCacheKey(uncachedCandidates[batchIndex].id, filters);
        
        cache.current.set(cacheKey, {
          score: scoredCandidate,
          timestamp: Date.now(),
          accessCount: 1
        });

        results[originalIndex] = scoredCandidate;
      });
    }

    return results;
  }, [generateCacheKey]);

  // Clean up old cache entries (LRU-based)
  const cleanupCache = useCallback((maxSize: number = 1000, maxAge: number = 300000) => {
    if (cache.current.size <= maxSize) return;

    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    
    // Remove expired entries first
    const validEntries = entries.filter(([key, entry]) => {
      if (now - entry.timestamp > maxAge) {
        cache.current.delete(key);
        return false;
      }
      return true;
    });

    // If still too large, remove least recently used entries
    if (validEntries.length > maxSize) {
      validEntries
        .sort((a, b) => a[1].timestamp - b[1].timestamp) // Sort by timestamp (oldest first)
        .slice(0, validEntries.length - maxSize)
        .forEach(([key]) => cache.current.delete(key));
    }
  }, []);

  // Periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      cleanupCache(1000, 300000); // Keep max 1000 entries, max age 5 minutes
    }, 60000); // Run every minute
    
    return () => clearInterval(cleanup);
  }, [cleanupCache]);

  return {
    getCachedScores,
    cleanupCache
  };
}