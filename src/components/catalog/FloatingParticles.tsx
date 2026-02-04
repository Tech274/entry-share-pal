import { useMemo } from 'react';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const FloatingParticles = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary-foreground) / 0.3) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          animationDuration: '8s',
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary-foreground) / 0.25) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          animationDuration: '10s',
          animationDelay: '-3s',
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 animate-pulse"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary-foreground) / 0.2) 0%, transparent 70%)',
          top: '40%',
          right: '20%',
          animationDuration: '12s',
          animationDelay: '-5s',
        }}
      />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary-foreground"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            animation: `float-particle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-10px, -50px) scale(0.9);
          }
          75% {
            transform: translate(15px, -20px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};
