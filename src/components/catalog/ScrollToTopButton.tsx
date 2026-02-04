import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export const ScrollToTopButton = ({ 
  threshold = 400, 
  className 
}: ScrollToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-24 right-6 z-50 h-12 w-12 rounded-full shadow-lg",
        "transition-all duration-300 ease-out",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "hover:scale-110 active:scale-95",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};
