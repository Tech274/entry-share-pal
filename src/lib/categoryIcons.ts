import { 
  Layers, Server, Cloud, Database, Shield, GitBranch, Building2, 
  Code2, Globe, TestTube2, BarChart3, Smartphone, Terminal, Box, Network, HardDrive, Wrench,
  Link2, Boxes, Brain, Workflow, Building, FlaskConical, BookOpen, Cog, Lock, Zap, 
  Monitor, Cpu, FileCode, Palette, Package, Radio, Rocket, Settings, Sparkles, Star,
  LucideIcon
} from 'lucide-react';

// Map of available icons for categories
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Layers,
  Server,
  Cloud,
  Database,
  Shield,
  GitBranch,
  Building2,
  Code2,
  Globe,
  TestTube2,
  BarChart3,
  Smartphone,
  Terminal,
  Box,
  Network,
  HardDrive,
  Wrench,
  Link2,
  Boxes,
  Brain,
  Workflow,
  Building,
  FlaskConical,
  BookOpen,
  Cog,
  Lock,
  Zap,
  Monitor,
  Cpu,
  FileCode,
  Palette,
  Package,
  Radio,
  Rocket,
  Settings,
  Sparkles,
  Star,
};

export const ICON_NAMES = Object.keys(CATEGORY_ICONS);

export const getIconComponent = (iconName: string): LucideIcon => {
  return CATEGORY_ICONS[iconName] || Layers;
};
