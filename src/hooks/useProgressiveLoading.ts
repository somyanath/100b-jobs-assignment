import { useState, useEffect } from 'react';

/**
 * A basic hook to progressively load an array of data in batches.
 * This prevents freezing the UI when rendering a large list.
 *
 * @param fullData The complete array of data to be loaded.
 * @param batchSize The number of items to load in each chunk. Defaults to 20.
 * @returns An object with the progressively loaded data and loading status.
 */
export function useProgressiveLoading<T>(fullData: T[], batchSize: number = 20) {
  const [loadedData, setLoadedData] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoadedData([]);
    setCurrentIndex(0);
  }, [fullData]);

  useEffect(() => {
    if (currentIndex >= fullData.length || fullData.length === 0) {
      return;
    }

    // Use a timeout to schedule the next batch, allowing the UI to stay responsive.
    const timer = setTimeout(() => {
      const nextIndex = Math.min(currentIndex + batchSize, fullData.length);
      const batch = fullData.slice(currentIndex, nextIndex);
      
      setLoadedData(prevData => [...prevData, ...batch]);
      setCurrentIndex(nextIndex);
    }, 0);

    return () => clearTimeout(timer);
  }, [currentIndex, batchSize, fullData.length]);

  const isComplete = fullData.length === 0 || currentIndex >= fullData.length;

  return {
    loadedData,
    isLoading: !isComplete,
  };
}