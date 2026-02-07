import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  headerColor: string;
  tooltip?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  headerColor,
  tooltip,
  onClick,
  children
}: KPICardProps) => {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default'}`}
      onClick={onClick}
    >
      <CardHeader className={`${headerColor} text-white py-2 px-3 rounded-t-lg`}>
        <CardTitle className="text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {title}
          </span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-2">
        <div className="text-xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  );
};
