import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StockSelectionConfig from './StockSelectionConfig';
import ConditionConfig from './ConditionConfig';
import OrderExecutionConfig from './OrderExecutionConfig';
import { NodeData } from '@/types/nodes';

interface NodeConfigPanelProps {
  nodeId: string | null;
  nodeType: string | null;
  data: NodeData;
  onUpdateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ 
  nodeId, 
  nodeType, 
  data, 
  onUpdateNodeData 
}) => {
  if (!nodeId || !nodeType) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Node Configuration</CardTitle>
          <CardDescription>Select a node to configure</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Click on a node in the flow to configure its properties.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDataChange = (newData: any) => {
    if (nodeId) {
      onUpdateNodeData(nodeId, {
        ...data,
        ...newData
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {data?.label || (
            nodeType === 'stockSelection' ? 'Stock Selection' :
            nodeType === 'condition' ? 'Condition' :
            nodeType === 'orderExecution' ? 'Order Execution' : 
            nodeType === 'start' ? 'Start' : 'Node'
          )}
        </CardTitle>
        <CardDescription>Configure node properties</CardDescription>
      </CardHeader>
      <CardContent>
        {nodeType === 'stockSelection' && (
          <StockSelectionConfig data={data} onChange={handleDataChange} />
        )}
        {nodeType === 'condition' && (
          <ConditionConfig data={data} onChange={handleDataChange} />
        )}
        {nodeType === 'orderExecution' && (
          <OrderExecutionConfig data={data} onChange={handleDataChange} />
        )}
        {nodeType === 'start' && (
          <div className="text-sm text-gray-500">
            <p>This is the starting point of your algorithm.</p>
            <p className="mt-2">Connect this node to the first step in your trading strategy.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NodeConfigPanel;
