
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";

type ChartType = 'line' | 'bar' | 'area';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

interface PerformanceChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  dataKey?: string;
  showToggle?: boolean;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function PerformanceChart({
  title,
  description,
  data,
  dataKey = "value",
  showToggle = true,
  height = 350,
  valuePrefix = "",
  valueSuffix = ""
}: PerformanceChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>('line');

  const handleValueFormat = (value: number) => {
    return `${valuePrefix}${value}${valueSuffix}`;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [handleValueFormat(value), title]}
              />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                fill="#4ade80" 
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [handleValueFormat(value), title]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#4ade80" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [handleValueFormat(value), title]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#4ade80" 
                strokeWidth={2}
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showToggle && (
            <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as ChartType)}>
              <ToggleGroupItem value="line" aria-label="Line chart">
                Line
              </ToggleGroupItem>
              <ToggleGroupItem value="bar" aria-label="Bar chart">
                Bar
              </ToggleGroupItem>
              <ToggleGroupItem value="area" aria-label="Area chart">
                Area
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
