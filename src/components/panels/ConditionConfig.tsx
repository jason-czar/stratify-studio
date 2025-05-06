
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConditionData } from '../../types/nodes';

interface ConditionConfigProps {
  data: ConditionData;
  onChange: (data: Partial<ConditionData>) => void;
}

const ConditionConfig: React.FC<ConditionConfigProps> = ({ data, onChange }) => {
  // Handle condition type change to reset child fields
  const handleConditionTypeChange = (type: ConditionData['conditionType']) => {
    onChange({ 
      conditionType: type,
      // Reset the fields that depend on condition type
      indicator: undefined,
      timeframe: undefined
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          value={data.label || ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Condition"
        />
      </div>

      <div>
        <Label htmlFor="condition-type">Condition Type</Label>
        <Select
          value={data.conditionType || ''}
          onValueChange={(value) => handleConditionTypeChange(value as ConditionData['conditionType'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select condition type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="technical">Technical Indicator</SelectItem>
            <SelectItem value="fundamental">Fundamental</SelectItem>
            <SelectItem value="time">Time-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.conditionType === 'technical' && (
        <div>
          <Label htmlFor="indicator">Indicator</Label>
          <Select
            value={data.indicator || ''}
            onValueChange={(value) => onChange({ indicator: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select indicator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMA">Simple Moving Average (SMA)</SelectItem>
              <SelectItem value="EMA">Exponential Moving Average (EMA)</SelectItem>
              <SelectItem value="RSI">Relative Strength Index (RSI)</SelectItem>
              <SelectItem value="MACD">MACD</SelectItem>
              <SelectItem value="BB">Bollinger Bands</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {data.conditionType === 'time' && (
        <div>
          <Label htmlFor="timeframe">Time Frame</Label>
          <Select
            value={data.timeframe || ''}
            onValueChange={(value) => onChange({ timeframe: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_open">Market Open</SelectItem>
              <SelectItem value="market_close">Market Close</SelectItem>
              <SelectItem value="custom_time">Custom Time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(data.conditionType === 'price' || data.conditionType === 'technical') && (
        <>
          <div>
            <Label htmlFor="operator">Operator</Label>
            <Select
              value={data.operator || ''}
              onValueChange={(value) => onChange({ operator: value as ConditionData['operator'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=">">Greater than (&gt;)</SelectItem>
                <SelectItem value="<">Less than (&lt;)</SelectItem>
                <SelectItem value="=">Equal to (=)</SelectItem>
                <SelectItem value=">=">Greater than or equal to (≥)</SelectItem>
                <SelectItem value="<=">Less than or equal to (≤)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              value={data.value?.toString() || ''}
              onChange={(e) => onChange({ value: parseFloat(e.target.value) || 0 })}
              placeholder="Value"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Optional description"
        />
      </div>
    </div>
  );
};

export default ConditionConfig;
