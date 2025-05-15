
import React, { useCallback, useEffect } from 'react';
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
import { toast } from '@/hooks/use-toast';

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
  
  // Log when initialNodes or initialEdges change
  useEffect(() => {
    console.log('AlgorithmFlow - initialNodes changed, count:', initialNodes.length);
  }, [initialNodes]);

  useEffect(() => {
    console.log('AlgorithmFlow - initialEdges changed, count:', initialEdges.length);
  }, [initialEdges]);

  // Update internal nodes state when initialNodes change
  useEffect(() => {
    console.log('AlgorithmFlow - Setting nodes from initialNodes');
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update internal edges state when initialEdges change
  useEffect(() => {
    console.log('AlgorithmFlow - Setting edges from initialEdges');
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);
  
  // Handle node changes and notify parent component
  const handleNodesChange = useCallback((changes) => {
    console.log('AlgorithmFlow - Nodes changing:', changes);
    onNodesChangeInternal(changes);
    if (onNodesChange) {
      console.log('AlgorithmFlow - Notifying parent of node changes');
      onNodesChange(nodes);
    }
  }, [onNodesChangeInternal, onNodesChange, nodes]);
  
  // Handle edge changes and notify parent component
  const handleEdgesChange = useCallback((changes) => {
    console.log('AlgorithmFlow - Edges changing:', changes);
    onEdgesChangeInternal(changes);
    if (onEdgesChange) {
      console.log('AlgorithmFlow - Notifying parent of edge changes');
      onEdgesChange(edges);
    }
  }, [onEdgesChangeInternal, onEdgesChange, edges]);

  const onConnect = useCallback(
    (params) => {
      console.log('AlgorithmFlow - Connecting edges:', params);
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      if (onEdgesChange) {
        console.log('AlgorithmFlow - Notifying parent of edge connection');
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
        onError={(error) => {
          console.error('AlgorithmFlow - ReactFlow error:', error);
          toast({
            title: 'Flow Error',
            description: 'An error occurred in the algorithm flow.',
            variant: 'destructive',
          });
        }}
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
