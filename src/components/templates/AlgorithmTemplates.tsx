
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, BookOpen, TrendingUp, Waypoints, Zap, Clock, ArrowRight } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/nodes';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Algorithm template definitions
const templates = [
  {
    id: 'moving-average-crossover',
    name: 'Moving Average Crossover',
    description: 'A strategy that buys when the fast moving average crosses above the slow moving average and sells when it crosses below',
    difficulty: 'Beginner',
    category: 'Technical',
    nodes: [
      // Simplified nodes for the template
      {
        id: 'start-1',
        type: 'start',
        data: { label: 'Start' },
        position: { x: 250, y: 25 },
      },
      {
        id: 'stock-1',
        type: 'stockSelection',
        data: { 
          label: 'Select Stock',
          ticker: 'AAPL',
          marketType: 'stock',
          exchange: 'NASDAQ' 
        },
        position: { x: 250, y: 125 },
      },
      {
        id: 'condition-1',
        type: 'condition',
        data: { 
          label: 'MA Crossover Check',
          conditionType: 'indicator',
          operator: 'crossover',
          value: 50
        },
        position: { x: 250, y: 250 },
      },
      {
        id: 'order-1',
        type: 'orderExecution',
        data: { 
          label: 'Buy Order',
          orderType: 'market',
          side: 'buy',
          quantity: 10,
          timeInForce: 'day'
        },
        position: { x: 125, y: 375 },
      },
      {
        id: 'order-2',
        type: 'orderExecution',
        data: { 
          label: 'Sell Order',
          orderType: 'market',
          side: 'sell',
          quantity: 10,
          timeInForce: 'day'
        },
        position: { x: 375, y: 375 },
      },
    ],
    edges: [
      { id: 'e-start-1-stock-1', source: 'start-1', target: 'stock-1' },
      { id: 'e-stock-1-condition-1', source: 'stock-1', target: 'condition-1' },
      { id: 'e-condition-1-order-1', source: 'condition-1', target: 'order-1', sourceHandle: 'outTrue' },
      { id: 'e-condition-1-order-2', source: 'condition-1', target: 'order-2', sourceHandle: 'outFalse' },
    ],
  },
  {
    id: 'rsi-overbought-oversold',
    name: 'RSI Overbought/Oversold',
    description: 'Buys when RSI indicates oversold conditions and sells when overbought',
    difficulty: 'Intermediate',
    category: 'Technical',
    nodes: [
      // Nodes would be defined here
    ],
    edges: [
      // Edges would be defined here
    ],
  },
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    description: 'Strategy that assumes prices will revert to their historical mean over time',
    difficulty: 'Advanced',
    category: 'Statistical',
    nodes: [
      // Nodes would be defined here
    ],
    edges: [
      // Edges would be defined here
    ],
  },
  {
    id: 'trend-following',
    name: 'Trend Following',
    description: 'Captures gains by riding market trends until they exhibit reversal signs',
    difficulty: 'Intermediate',
    category: 'Technical',
    nodes: [
      // Nodes would be defined here
    ],
    edges: [
      // Edges would be defined here
    ],
  },
  {
    id: 'earnings-announcement',
    name: 'Earnings Announcement',
    description: 'Strategy that trades around company earnings announcements',
    difficulty: 'Advanced',
    category: 'Fundamental',
    nodes: [
      // Nodes would be defined here
    ],
    edges: [
      // Edges would be defined here
    ],
  },
  {
    id: 'dollar-cost-average',
    name: 'Dollar Cost Averaging',
    description: 'Regularly purchases a fixed dollar amount regardless of price',
    difficulty: 'Beginner',
    category: 'Long-term',
    nodes: [
      // Nodes would be defined here
    ],
    edges: [
      // Edges would be defined here
    ],
  },
];

interface TemplateCardProps {
  template: typeof templates[0];
  onSelect: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const difficultyColor = {
    'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Intermediate': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }[template.difficulty];

  const categoryIcon = {
    'Technical': <TrendingUp className="h-4 w-4" />,
    'Statistical': <Waypoints className="h-4 w-4" />,
    'Fundamental': <BookOpen className="h-4 w-4" />,
    'Long-term': <Clock className="h-4 w-4" />,
  }[template.category] || <Zap className="h-4 w-4" />;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant="outline" className={difficultyColor}>
            {template.difficulty}
          </Badge>
        </div>
        <div className="flex items-center">
          <Badge variant="secondary" className="flex items-center gap-1">
            {categoryIcon}
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="default" className="w-full" onClick={() => onSelect(template.id)}>
          Use Template
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export function AlgorithmTemplates() {
  const [category, setCategory] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredTemplates = templates.filter(template => 
    category === 'all' || template.category.toLowerCase() === category
  );

  const handleSelectTemplate = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    
    if (selectedTemplate) {
      // In a real implementation, this would set the nodes and edges in the flow editor
      toast({
        title: "Template selected",
        description: `${selectedTemplate.name} template has been loaded`,
      });
      
      // Navigate to the editor with the template ID as a query param
      navigate(`/?template=${templateId}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Algorithm Templates</CardTitle>
        <CardDescription>
          Start with a pre-built algorithm template to save time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="all" value={category} onValueChange={setCategory}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="statistical">Statistical</TabsTrigger>
            <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
            <TabsTrigger value="long-term">Long-term</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onSelect={handleSelectTemplate} 
              />
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
