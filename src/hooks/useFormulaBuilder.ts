
import { useState, useCallback } from 'react';

type Operator = '+' | '-' | '*' | '/' | '>' | '<' | '=' | '>=' | '<=';
type OperandType = 'number' | 'price' | 'indicator' | 'constant';

export interface FormulaOperand {
  type: OperandType;
  value: string | number;
  label?: string;
}

export interface FormulaOperation {
  left: FormulaOperand;
  operator: Operator;
  right: FormulaOperand;
}

export interface Formula {
  operations: FormulaOperation[];
  result?: number | boolean;
}

export const useFormulaBuilder = () => {
  const [formula, setFormula] = useState<Formula>({ operations: [] });

  const addOperation = useCallback((operation: FormulaOperation) => {
    setFormula(prev => ({
      ...prev,
      operations: [...prev.operations, operation]
    }));
  }, []);

  const removeOperation = useCallback((index: number) => {
    setFormula(prev => ({
      ...prev,
      operations: prev.operations.filter((_, i) => i !== index)
    }));
  }, []);

  const updateOperation = useCallback((index: number, operation: Partial<FormulaOperation>) => {
    setFormula(prev => ({
      ...prev,
      operations: prev.operations.map((op, i) => 
        i === index ? { ...op, ...operation } : op
      )
    }));
  }, []);

  const evaluateFormula = useCallback((marketData: Record<string, any>): number | boolean => {
    // Simple single operation evaluation for now
    if (formula.operations.length === 0) return 0;
    
    const operation = formula.operations[0];
    let leftValue: number;
    let rightValue: number;

    // Resolve left operand
    switch (operation.left.type) {
      case 'number':
        leftValue = Number(operation.left.value);
        break;
      case 'price':
        leftValue = marketData.price?.[operation.left.value as string] || 0;
        break;
      case 'indicator':
        leftValue = marketData.indicators?.[operation.left.value as string] || 0;
        break;
      case 'constant':
      default:
        leftValue = Number(operation.left.value);
    }

    // Resolve right operand
    switch (operation.right.type) {
      case 'number':
        rightValue = Number(operation.right.value);
        break;
      case 'price':
        rightValue = marketData.price?.[operation.right.value as string] || 0;
        break;
      case 'indicator':
        rightValue = marketData.indicators?.[operation.right.value as string] || 0;
        break;
      case 'constant':
      default:
        rightValue = Number(operation.right.value);
    }

    // Perform the operation
    let result: number | boolean;
    switch (operation.operator) {
      case '+': 
        result = leftValue + rightValue;
        break;
      case '-':
        result = leftValue - rightValue;
        break;
      case '*':
        result = leftValue * rightValue;
        break;
      case '/':
        result = rightValue !== 0 ? leftValue / rightValue : NaN;
        break;
      case '>':
        result = leftValue > rightValue;
        break;
      case '<':
        result = leftValue < rightValue;
        break;
      case '=':
        result = leftValue === rightValue;
        break;
      case '>=':
        result = leftValue >= rightValue;
        break;
      case '<=':
        result = leftValue <= rightValue;
        break;
      default:
        result = 0;
    }

    return result;
  }, [formula]);

  return {
    formula,
    addOperation,
    removeOperation,
    updateOperation,
    evaluateFormula,
    setFormula
  };
};
