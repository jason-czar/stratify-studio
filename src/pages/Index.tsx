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
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NodeData } from '@/types/nodes';

const initialNodes: Node<NodeData>[] = [
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Alpaca Trading Algorithm Builder</h1>
        
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
                      <Button size="sm" variant="outline" className="bg-white">
                        <Plus className="h-4 w-4 mr-1" /> Add Node
                      </Button>
                    </Panel>
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4">
                Deploy to Alpaca
              </Button>
            </div>
          </div>
          
          <div>
            <NodeConfigPanel 
              nodeId={selectedNode?.id || null}
              nodeType={selectedNode?.type || null}
              data={selectedNode?.data || {}}
              onUpdateNodeData={updateNodeData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
