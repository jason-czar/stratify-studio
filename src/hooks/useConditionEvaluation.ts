
import { useCallback } from 'react';
import { ConditionData } from '@/types/nodes';

interface MarketData {
  price?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  indicators?: Record<string, number>;
  timestamp?: Date;
  [key: string]: any;
}

export const useConditionEvaluation = () => {
  const evaluateCondition = useCallback((condition: ConditionData, marketData: MarketData): boolean => {
    if (!condition.conditionType || !condition.operator || condition.value === undefined) {
      console.warn('Incomplete condition configuration');
      return false;
    }

    let leftValue: number;
    const rightValue = Number(condition.value);

    // Extract the relevant value from market data based on condition type
    switch (condition.conditionType) {
      case 'price':
        leftValue = marketData.price || 0;
        break;
      case 'technical':
        if (!condition.indicator) {
          console.warn('No indicator specified for technical condition');
          return false;
        }
        leftValue = marketData.indicators?.[condition.indicator] || 0;
        break;
      case 'fundamental':
        // Would need more specific fundamental data structure
        leftValue = 0;
        break;
      case 'time':
        // Time-based conditions would need special handling
        if (condition.timeframe === 'market_open') {
          // Example logic - would need to be replaced with actual market hours check
          const now = marketData.timestamp || new Date();
          const hours = now.getHours();
          return hours === 9 && now.getMinutes() >= 30; // 9:30 AM example
        }
        return false;
      default:
        leftValue = 0;
    }

    // Perform the comparison
    switch (condition.operator) {
      case '>':
        return leftValue > rightValue;
      case '<':
        return leftValue < rightValue;
      case '=':
        return leftValue === rightValue;
      case '>=':
        return leftValue >= rightValue;
      case '<=':
        return leftValue <= rightValue;
      default:
        return false;
    }
  }, []);

  return { evaluateCondition };
};
