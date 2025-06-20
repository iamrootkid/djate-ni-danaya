import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { DateFilter } from "@/types/invoice";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicMetricProps {
  dateFilter: DateFilter;
}

export function DynamicMetric({ dateFilter }: DynamicMetricProps) {
  const queryClient = useQueryClient();
  // Convert 'all' to 'daily' when using useStockSummary
  const stockSummaryFilter = dateFilter === 'all' ? 'daily' : (dateFilter as 'daily' | 'monthly' | 'yesterday');
  const { data: stockSummary, isLoading, error } = useStockSummary(new Date(), stockSummaryFilter);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [previousValue, setPreviousValue] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  
  // Set up the animated counter
  useEffect(() => {
    if (!stockSummary) return;
    
    const targetValue = stockSummary.total_income || 0;
    
    // Only update previous value when we have a new target value
    if (previousValue !== targetValue) {
      setPreviousValue(animatedValue);
      setIsIncreasing(targetValue >= previousValue);
      
      // Animate the counter from current to target
      let startValue = animatedValue;
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
    }
  }, [stockSummary, previousValue, animatedValue]);
  
  // Set up real-time subscription for sales updates
  useEffect(() => {
    if (isSubscribedRef.current) {
      return;
    }

    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    try {
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
            console.log("Sales change detected in dynamic metric:", payload);
            queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          }
        )
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'invoices' 
          },
          (payload) => {
            console.log("Invoice change detected in dynamic metric:", payload);
            queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          }
        );

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          channelRef.current = channel;
        }
      });

    } catch (error) {
      console.error("Error setting up dynamic metric channel:", error);
    }
      
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [queryClient]);
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num) + ' F CFA';
  };
  
  const getLabel = () => {
    switch(dateFilter) {
      case 'daily':
        return 'Revenus du jour';
      case 'yesterday':
        return 'Revenus d\'hier';
      case 'monthly':
        return 'Revenus du mois';
      default:
        return 'Revenus en temps réel';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle>Revenus en temps réel</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    console.error("Error fetching stock summary:", error);
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden relative">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Revenus en temps réel</span>
            <Activity className="h-5 w-5 text-red-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Erreur de chargement des données. Veuillez réessayer.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{getLabel()}</span>
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
