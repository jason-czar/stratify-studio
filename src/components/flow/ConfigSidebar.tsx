
import React from 'react';
import { Node } from 'reactflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NodeConfigPanel from '../panels/NodeConfigPanel';
import BacktestPanel from '../panels/BacktestPanel';
import { NodeData } from '@/types/nodes';

interface ConfigSidebarProps {
  selectedNode: Node<NodeData> | null;
  nodes: Node<NodeData>[];
  edges: any[];
  onUpdateNodeData: (nodeId: string, newData: any) => void;
}

export const ConfigSidebar: React.FC<ConfigSidebarProps> = ({ 
  selectedNode, 
  nodes, 
  edges, 
  onUpdateNodeData 
}) => {
  // Create a default empty data object that conforms to NodeData type
  const defaultEmptyData = { label: '' };

  return (
    <div className="h-full overflow-auto">
      <Tabs defaultValue="config" className="h-full flex flex-col">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="config">Configure</TabsTrigger>
          <TabsTrigger value="backtest">Backtest</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="flex-1 overflow-auto pb-2">
          <NodeConfigPanel 
            nodeId={selectedNode?.id || null}
            nodeType={selectedNode?.type || null}
            data={selectedNode?.data || defaultEmptyData}
            onUpdateNodeData={onUpdateNodeData}
          />
        </TabsContent>
        
        <TabsContent value="backtest" className="flex-1 overflow-auto pb-2">
          <BacktestPanel nodes={nodes} edges={edges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
