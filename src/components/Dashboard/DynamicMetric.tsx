
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DateFilter } from "@/types/invoice";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DynamicMetricProps {
  dateFilter: DateFilter;
}

export function DynamicMetric({ dateFilter }: DynamicMetricProps) {
  const queryClient = useQueryClient();
  const { data: stockSummary } = useStockSummary(new Date(), dateFilter);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [previousValue, setPreviousValue] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(true);
  
  // Set up the animated counter
  useEffect(() => {
    if (!stockSummary) return;
    
    const targetValue = stockSummary.total_income || 0;
    setPreviousValue(animatedValue);
    setIsIncreasing(targetValue >= previousValue);
    
    // Animate the counter from current to target
    let startValue = previousValue;
    const duration = 1000;
    const startTime = Date.now();
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutExpo animation function
      const easeProgress = progress === 1 
        ? 1 
        : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = startValue + easeProgress * (targetValue - startValue);
      setAnimatedValue(Math.round(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [stockSummary]);
  
  // Set up real-time subscription for sales updates
  useEffect(() => {
    const channel = supabase
      .channel('dynamic-sales-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'sales' 
        },
        (payload) => {
          console.log("Sales change detected in dynamic metric");
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num) + ' F CFA';
  };
  
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Revenus en temps réel</span>
          {isIncreasing ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight text-primary transition-all">
          {formatNumber(animatedValue)}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {isIncreasing 
            ? "En hausse par rapport à la période précédente" 
            : "En baisse par rapport à la période précédente"}
        </p>
      </CardContent>
    </Card>
  );
}
