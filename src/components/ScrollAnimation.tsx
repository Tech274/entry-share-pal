import React from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';
  delay?: number;
  threshold?: number;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const animationClasses: Record<string, string> = {
    'fade-up': 'translate-y-8 opacity-0',
    'fade-in': 'opacity-0',
    'scale-in': 'scale-95 opacity-0',
    'slide-left': 'translate-x-8 opacity-0',
    'slide-right': '-translate-x-8 opacity-0',
  };

  const visibleClasses = 'translate-y-0 translate-x-0 scale-100 opacity-100';

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? visibleClasses : animationClasses[animation],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
