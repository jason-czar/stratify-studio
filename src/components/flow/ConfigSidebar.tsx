
import React from 'react';
import { Node } from 'reactflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NodeConfigPanel from '../panels/NodeConfigPanel';
import BacktestPanel from '../panels/BacktestPanel';
import { NodeData } from '@/types/nodes';
import AlpacaConnectionStatus from '@/components/AlpacaConnectionStatus';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  // State for the collapsible Alpaca status section
  const [alpacaStatusOpen, setAlpacaStatusOpen] = React.useState(false);
  
  // Create a default empty data object that conforms to NodeData type
  const defaultEmptyData = { label: '' };

  return (
    <div>
      {/* Alpaca connection status card with collapsible functionality */}
      <Collapsible
        open={alpacaStatusOpen}
        onOpenChange={setAlpacaStatusOpen}
        className="w-full border rounded-lg shadow-sm bg-card"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="text-sm font-medium">Alpaca Connection Status</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {alpacaStatusOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="p-4">
            <AlpacaConnectionStatus />
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <div className="mt-4">
        <Tabs defaultValue="config">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="config">Configure</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <NodeConfigPanel 
              nodeId={selectedNode?.id || null}
              nodeType={selectedNode?.type || null}
              data={selectedNode?.data || defaultEmptyData}
              onUpdateNodeData={onUpdateNodeData}
            />
          </TabsContent>
          
          <TabsContent value="backtest">
            <BacktestPanel nodes={nodes} edges={edges} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
