
import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../nodes/nodeTypes';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NodeData } from '@/types/nodes';

interface AlgorithmFlowProps {
  initialNodes: Node<NodeData>[];
  initialEdges: any[];
  onNodeClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  onNodesChange?: (nodes: Node<NodeData>[]) => void;
  onEdgesChange?: (edges: any[]) => void;
}

export const AlgorithmFlow: React.FC<AlgorithmFlowProps> = ({ 
  initialNodes, 
  initialEdges, 
  onNodeClick,
  onNodesChange,
  onEdgesChange 
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  
  // Handle node changes and notify parent component
  const handleNodesChange = useCallback((changes) => {
    onNodesChangeInternal(changes);
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [onNodesChangeInternal, onNodesChange, nodes]);
  
  // Handle edge changes and notify parent component
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChangeInternal(changes);
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [onEdgesChangeInternal, onEdgesChange, edges]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      if (onEdgesChange) {
        onEdgesChange(newEdges);
      }
    },
    [edges, setEdges, onEdgesChange]
  );

  return (
    <div style={{ height: '600px' }} className="rounded">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
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
  );
};
