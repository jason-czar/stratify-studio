import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../components/nodes/nodeTypes';
import NodeConfigPanel from '../components/panels/NodeConfigPanel';
import BacktestPanel from '../components/panels/BacktestPanel';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NodeData, StartNodeData } from '@/types/nodes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlpacaConnectionStatus from '@/components/AlpacaConnectionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { SaveAlgorithmDialog } from '@/components/SaveAlgorithmDialog';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TradingAssistantChat } from '@/components/chat/TradingAssistantChat';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const initialNodes: Node<NodeData>[] = [
  {
    id: 'start-1',
    type: 'start',
    data: { label: 'Start' } as StartNodeData,
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
      label: 'Set Conditions',
      conditionType: 'price',
      operator: '>',
      value: 150
    },
    position: { x: 250, y: 250 },
  },
  {
    id: 'order-1',
    type: 'orderExecution',
    data: { 
      label: 'Execute Order',
      orderType: 'market',
      side: 'buy',
      quantity: 10,
      timeInForce: 'day'
    },
    position: { x: 250, y: 375 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-start-1-stock-1', source: 'start-1', target: 'stock-1', sourceHandle: 'out', targetHandle: 'in' },
  { id: 'e-stock-1-condition-1', source: 'stock-1', target: 'condition-1', sourceHandle: 'out', targetHandle: 'in' },
  { id: 'e-condition-1-order-1', source: 'condition-1', target: 'order-1', sourceHandle: 'outTrue', targetHandle: 'in' },
];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alpacaStatusOpen, setAlpacaStatusOpen] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleSaveSuccess = () => {
    navigate('/dashboard');
  };

  // Create a default empty data object that conforms to NodeData type
  const defaultEmptyData: StartNodeData = { label: '' };

  // Handle updates from the Trading Assistant
  const handleUpdateNodes = useCallback((updatedNodes) => {
    setNodes(updatedNodes);
  }, [setNodes]);

  const handleUpdateEdges = useCallback((updatedEdges) => {
    setEdges(updatedEdges);
  }, [setEdges]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Trading Assistant Chat positioned on the left */}
        <TradingAssistantChat 
          nodes={nodes}
          edges={edges}
          onUpdateNodes={handleUpdateNodes}
          onUpdateEdges={handleUpdateEdges}
        />
        
        {/* Main content with left padding to accommodate the chat panel */}
        <div className="pl-80 transition-all duration-300 ease-in-out">
          <div className="p-4">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Stratify Algorithm Builder</h1>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardContent className="p-0">
                    <div style={{ height: '600px' }} className="rounded">
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                      >
                        <Controls />
                        <MiniMap zoomable pannable />
                        <Background color="#aaa" gap={16} />
                        
                        <Panel position="top-left" className="m-2">
                          <Button size="sm" variant="outline" className="bg-background">
                            <Plus className="h-4 w-4 mr-1" /> Add Node
                          </Button>
                        </Panel>
                      </ReactFlow>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-center space-x-4">
                  <SaveAlgorithmDialog 
                    nodes={nodes}
                    edges={edges}
                    onSaveSuccess={handleSaveSuccess}
                  />
                  
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4"
                    onClick={() => {
                      // This would trigger deployment to Alpaca
                      // For now, just navigate to dashboard
                      navigate('/dashboard');
                    }}
                  >
                    Deploy to Alpaca
                  </Button>
                </div>
              </div>
              
              <div>
                {/* Add Alpaca connection status card with collapsible functionality */}
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
                        onUpdateNodeData={updateNodeData}
                      />
                    </TabsContent>
                    
                    <TabsContent value="backtest">
                      <BacktestPanel nodes={nodes} edges={edges} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
