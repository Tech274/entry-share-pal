import { useState, useEffect, useCallback } from 'react';

interface UseParallaxOptions {
  speed?: number; // Parallax speed multiplier (default 0.5)
  maxOffset?: number; // Maximum offset in pixels
}

export const useParallax = ({ speed = 0.5, maxOffset = 100 }: UseParallaxOptions = {}) => {
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const newOffset = Math.min(scrollY * speed, maxOffset);
    setOffset(newOffset);
  }, [speed, maxOffset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return offset;
};
