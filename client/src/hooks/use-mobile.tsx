import { useState, useEffect } from 'react';

/**
 * Hook to determine if the current screen size is considered mobile
 * @param {number} breakpoint - The pixel width threshold below which is considered mobile (default: 768)
 * @returns {boolean} - True if screen width is below the breakpoint
 */
export function useIsMobile(breakpoint: number = 768) {
  // Initialize state with a function to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(() => {
    // Only execute the check in a browser environment
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    // Exit if not in a browser environment
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add event listener to track window resizing
    window.addEventListener('resize', checkMobile);
    
    // Initial check
    checkMobile();

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to get the current screen width and breakpoint category
 * @returns {Object} - Object containing width and device category
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    device: 'unknown'
  });

  useEffect(() => {
    // Exit if not in a browser environment
    if (typeof window === 'undefined') return;

    const updateScreenSize = () => {
      const width = window.innerWidth;
      let device = 'desktop';
      
      if (width < 640) {
        device = 'mobile';
      } else if (width < 1024) {
        device = 'tablet';
      }

      setScreenSize({ width, device });
    };

    // Listen for window resize
    window.addEventListener('resize', updateScreenSize);
    
    // Initial check
    updateScreenSize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  return screenSize;
}