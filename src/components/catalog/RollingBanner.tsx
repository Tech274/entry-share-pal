import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Server, Cloud, Database, Brain, Layers, Workflow, Shield, Code2, BarChart3, Network, Sparkles, LucideIcon } from 'lucide-react';

export interface LabHighlight {
  title: string;
  tagline: string;
  features: string[];
  icon: LucideIcon;
  gradient: string;
}

export const labHighlights: LabHighlight[] = [
  {
    title: 'SAP Labs',
    tagline: 'Enterprise ERP Excellence',
    features: ['S/4HANA', 'BTP Integration', 'ABAP Development', 'Fiori UX'],
    icon: Layers,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Infrastructure Labs',
    tagline: 'Build & Scale with Confidence',
    features: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD Pipelines'],
    icon: Server,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Oracle Labs',
    tagline: 'Database Mastery Unlocked',
    features: ['Oracle Cloud', 'PL/SQL', 'RAC Clusters', 'Data Guard'],
    icon: Database,
    gradient: 'from-red-500 to-rose-600',
  },
  {
    title: 'GenAI / Agentic AI Labs',
    tagline: 'Future-Ready AI Training',
    features: ['LLM Fine-Tuning', 'Prompt Engineering', 'RAG Systems', 'AI Agents'],
    icon: Brain,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'AI/ML Labs',
    tagline: 'Intelligent Systems Mastery',
    features: ['Model Training', 'MLOps', 'Deep Learning', 'Computer Vision'],
    icon: Sparkles,
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    title: 'Networking Labs',
    tagline: 'Connect Everything Securely',
    features: ['Routing & Switching', 'SD-WAN', 'Network Automation', 'Firewalls'],
    icon: Network,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Cloud Labs',
    tagline: 'Multi-Cloud Expertise',
    features: ['AWS', 'Azure', 'GCP', 'Hybrid Solutions'],
    icon: Cloud,
    gradient: 'from-sky-500 to-indigo-600',
  },
  {
    title: 'DevOps Labs',
    tagline: 'Automate Everything',
    features: ['GitOps', 'Monitoring', 'Security', 'Observability'],
    icon: Workflow,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Security Labs',
    tagline: 'Defend & Protect',
    features: ['Penetration Testing', 'SIEM', 'Zero Trust', 'Compliance'],
    icon: Shield,
    gradient: 'from-slate-500 to-zinc-700',
  },
  {
    title: 'Data Engineering Labs',
    tagline: 'Transform & Scale Data',
    features: ['Apache Spark', 'Kafka', 'Airflow', 'Data Lakes'],
    icon: BarChart3,
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    title: 'Full Stack Labs',
    tagline: 'End-to-End Development',
    features: ['React', 'Node.js', 'APIs', 'Microservices'],
    icon: Code2,
    gradient: 'from-lime-500 to-green-600',
  },
];

// RollingBannerProps interface is now defined inside the component file below

interface RollingBannerProps {
  onLabChange?: (lab: LabHighlight, index: number, isTransitioning: boolean) => void;
  onIndexChange?: (index: number) => void;
  onGoToIndex?: (goToIndex: (idx: number) => void) => void;
  isPaused?: boolean;
}

export const RollingBanner = ({ onLabChange, onIndexChange, onGoToIndex, isPaused = false }: RollingBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const current = labHighlights[currentIndex];
  const Icon = current.icon;

  // Notify parent of lab change and transition state
  useEffect(() => {
    onLabChange?.(current, currentIndex, isTransitioning);
  }, [current, currentIndex, isTransitioning, onLabChange]);

  // Expose method to change index from parent
  const goToIndex = useCallback((idx: number) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex]);

  // Expose goToIndex function to parent
  useEffect(() => {
    onGoToIndex?.(goToIndex);
  }, [goToIndex, onGoToIndex]);

  // Expose current index via onIndexChange callback
  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  // Auto-cycle through labs (respects pause state)
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % labHighlights.length);
        setIsTransitioning(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Main Banner Content */}
      <div 
        className={cn(
          "flex flex-col items-center gap-3 transition-all duration-500",
          isTransitioning 
            ? "opacity-0 translate-y-4" 
            : "opacity-100 translate-y-0"
        )}
      >
        {/* Icon and Title Row */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl bg-gradient-to-br shadow-lg",
            current.gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary-foreground">
              {current.title}
            </h3>
            <p className="text-sm text-primary-foreground/70">
              {current.tagline}
            </p>
          </div>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {current.features.map((feature, idx) => (
            <span
              key={feature}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                "bg-primary-foreground/10 text-primary-foreground/90 border border-primary-foreground/20",
                "animate-fade-in"
              )}
              style={{ 
                animationDelay: `${idx * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {labHighlights.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(idx);
                setIsTransitioning(false);
              }, 300);
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === currentIndex 
                ? "w-6 bg-primary-foreground" 
                : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
            )}
            aria-label={`Go to ${labHighlights[idx].title}`}
          />
        ))}
      </div>

      {/* Subtle animated underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <div 
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-500",
            current.gradient
          )}
          style={{
            width: `${((currentIndex + 1) / labHighlights.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
