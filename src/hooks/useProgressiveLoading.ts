import { useState, useEffect } from 'react';

/**
 * A basic hook to progressively load an array of data in batches.
 * This prevents freezing the UI when rendering a large list.
 *
 * @param fullData The complete array of data to be loaded.
 * @param batchSize The number of items to load in each chunk. Defaults to 20.
 * @returns An object with the progressively loaded data and loading status.
 */
export function useProgressiveLoader<T>(fullData: T[], batchSize: number = 20) {
  // State to hold the portion of data that has been loaded so far
  const [loadedData, setLoadedData] = useState<T[]>([]);
  // State to track our position in the fullData array
  const [currentIndex, setCurrentIndex] = useState(0);

  // This effect resets the loader whenever the source data changes (e.g., due to filtering)
  useEffect(() => {
    setLoadedData([]);
    setCurrentIndex(0);
  }, [fullData]);

  // This effect loads the next batch of data
  useEffect(() => {
    // Stop if all data has been loaded
    if (currentIndex >= fullData.length) {
      return;
    }

    // Use a timeout to schedule the next batch processing.
    // This yields to the browser, allowing it to remain responsive.
    const timer = setTimeout(() => {
      const nextIndex = currentIndex + batchSize;
      const batch = fullData.slice(currentIndex, nextIndex);
      
      setLoadedData(prevData => [...prevData, ...batch]);
      setCurrentIndex(nextIndex);
    }, 0); // A minimal delay is all that's needed

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [currentIndex, fullData, batchSize]);

  // Derived state to easily check the loading status
  const isComplete = currentIndex >= fullData.length && fullData.length > 0;

  return {
    loadedData,           // The array of items loaded so far
    isLoading: !isComplete, // A simple boolean to indicate if loading is in progress
  };
}